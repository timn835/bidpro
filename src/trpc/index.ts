import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  privateAdminProcedure,
  privateUserProcedure,
  publicProcedure,
  router,
} from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getPlaiceholder } from "plaiceholder";
import {
  createAuctionSchema,
  createLotSchema,
  imageSchema,
  updateAuctionSchema,
  updateLotSchema,
} from "@/lib/types";
import { absoluteUrl, deleteImagesFromS3 } from "@/lib/utils";
import {
  INFINITE_QUERY_LIMIT,
  MAX_NUM_LOTS_PER_AUCTION,
} from "@/config/constants";
import { revalidatePath } from "next/cache";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    // create a user if it was not found
    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }
    return { success: true };
  }),

  getUserAuctions: privateAdminProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.auction.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: { Lot: true },
        },
      },
    });
  }),

  getImage: privateAdminProcedure
    .input(z.object({ auctionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const auction = await db.auction.findFirst({
        where: {
          id: input.auctionId,
          userId,
        },
      });

      if (!auction) throw new TRPCError({ code: "NOT_FOUND" });
      return auction;
    }),

  createAuction: privateAdminProcedure
    .input(createAuctionSchema)
    .mutation(async ({ ctx, input }) => {
      const newAuction = await db.auction.create({
        data: {
          title: input.title,
          location: input.location,
          startsAt: input.startDate,
          endsAt: input.endDate,
          userId: ctx.userId,
        },
      });
      return newAuction;
    }),

  updateAuction: privateAdminProcedure
    .input(updateAuctionSchema)
    .mutation(async ({ input }) => {
      // check that the auction to update exists
      const auctionToUpdate = await db.auction.findFirst({
        where: { id: input.auctionId },
      });
      if (!auctionToUpdate) throw new TRPCError({ code: "NOT_FOUND" });

      // if the auction has already started, check that we are not changing the start date
      if (auctionToUpdate.startsAt < new Date()) {
        if (auctionToUpdate.startsAt.getTime() !== input.startDate.getTime()) {
          throw new TRPCError({ code: "BAD_REQUEST" });
        }
      }

      // check that the start date is in the future if it needs to be updated
      if (
        input.startDate <= new Date() &&
        input.startDate.getTime() !== auctionToUpdate.startsAt.getTime()
      )
        throw new TRPCError({ code: "BAD_REQUEST" });

      // if the auction has already ended, reject the request
      if (auctionToUpdate.endsAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await db.auction.update({
        where: { id: input.auctionId },
        data: {
          title: input.title,
          location: input.location,
          startsAt: input.startDate,
          endsAt: input.endDate,
        },
      });

      // revalidate path
      revalidatePath(`/dashboard/auctions/${input.auctionId}`);
    }),

  deleteAuction: privateAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const auction = await db.auction.findFirst({
        where: { id: input.id, userId },
        include: {
          _count: {
            select: {
              Lot: true,
            },
          },
        },
      });

      if (!auction) throw new TRPCError({ code: "NOT_FOUND" });

      // check if there are lots with this auctionId that exist
      if (auction._count.Lot > 0) throw new TRPCError({ code: "BAD_REQUEST" });

      await db.auction.delete({ where: { id: input.id } });

      if (!auction.imgUrl) return auction;

      // delete image from s3
      try {
        const s3 = new S3Client({
          region: process.env.MY_AWS_BUCKET_REGION!,
          credentials: {
            accessKeyId: process.env.MY_AWS_ACCESS_KEY!,
            secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
          },
        });
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: process.env.MY_AWS_BUCKET_NAME,
          Key: auction.imgUrl.split("/").pop(),
        });
        await s3.send(deleteObjectCommand);
      } catch (error) {
        console.log("unable to delete image from s3");
        console.error();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return auction;
    }),

  getAuctionLots: publicProcedure
    .input(
      z.object({
        auctionId: z.string(),
        limit: z.number().min(1).max(MAX_NUM_LOTS_PER_AUCTION).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { auctionId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      const lots = await db.lot.findMany({
        where: {
          auctionId,
        },
        orderBy: {
          lotNumber: "desc",
        },
        include: {
          _count: {
            select: { Bid: true },
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (lots.length > limit) {
        const nextItem = lots.pop();
        nextCursor = nextItem?.id;
      }

      // get blur image urls
      // const base64Promises = lots.map((lot) =>
      //   lot.mainImgUrl ? getBase64(lot.mainImgUrl) : "/standard-lot-small.jpg"
      // );
      // const blurImgUrls = await Promise.all(base64Promises);

      return {
        lots,
        // blurImgUrls,
        nextCursor,
      };
    }),

  getLot: publicProcedure
    .input(z.object({ lotId: z.string() }))
    .query(async ({ input }) => {
      const lot = await db.lot.findFirst({
        where: { id: input.lotId },
        include: {
          _count: {
            select: {
              Bid: true,
            },
          },
          LotImage: {
            select: {
              id: true,
              imgUrl: true,
            },
          },
          Auction: {
            select: {
              id: true,
              endsAt: true,
            },
          },
        },
      });

      if (!lot) throw new TRPCError({ code: "NOT_FOUND" });

      // get blur image urls
      const base64Promises = lot.LotImage.map((image) =>
        getBase64(image.imgUrl)
      );
      const blurImgUrls = await Promise.all(base64Promises);
      return { lot, blurImgUrls };
    }),

  createLot: privateAdminProcedure
    .input(createLotSchema)
    .mutation(async ({ ctx, input }) => {
      // make sure the auction exists and belongs to user
      const auction = await db.auction.findFirst({
        where: { id: input.auctionId, userId: ctx.userId },
        include: {
          _count: {
            select: {
              Lot: true,
            },
          },
        },
      });
      if (!auction) throw new TRPCError({ code: "NOT_FOUND" });

      // make sure the auction has not yet started
      if (auction.startsAt.getTime() < new Date().getTime())
        throw new TRPCError({ code: "BAD_REQUEST" });

      // make sure that there are no more than 100 lots
      if (auction._count.Lot >= MAX_NUM_LOTS_PER_AUCTION) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // create the lot
      const newLot = await db.lot.create({
        data: {
          ...input,
          lotNumber: auction._count.Lot + 1,
        },
      });
      return newLot;
    }),

  updateLot: privateAdminProcedure
    .input(updateLotSchema)
    .mutation(async ({ ctx, input }) => {
      // check that the auction to update exists
      const lotToUpdate = await db.lot.findFirst({
        where: { id: input.lotId },
        include: {
          Auction: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!lotToUpdate) throw new TRPCError({ code: "NOT_FOUND" });
      if (lotToUpdate.Auction?.userId !== ctx.userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      const newMinBid = lotToUpdate.topBidId
        ? lotToUpdate.minBid
        : input.minBid;

      await db.lot.update({
        where: { id: input.lotId },
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          minBid: newMinBid,
        },
      });
    }),

  removeImages: privateAdminProcedure
    .input(imageSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (
        !input.every(async (image) => {
          const imageFromDB = await db.lotImage.findFirst({
            where: {
              id: image.id,
            },
            include: {
              Lot: {
                select: {
                  Auction: {
                    select: {
                      userId: true,
                    },
                  },
                },
              },
            },
          });
          return imageFromDB?.Lot?.Auction?.userId === userId;
        })
      )
        throw new TRPCError({ code: "FORBIDDEN" });

      await deleteImagesFromS3(input);
    }),

  deleteLot: privateAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const lot = await db.lot.findFirst({
        where: { id: input.id },
        select: {
          Auction: {
            select: {
              id: true,
              userId: true,
            },
          },
          lotNumber: true,
          LotImage: {
            select: {
              id: true,
              imgUrl: true,
            },
          },
        },
      });

      if (!lot) throw new TRPCError({ code: "NOT_FOUND" });

      // check if the user that owns the auction of the lot is the same
      // as the one trying to delete the lot
      if (lot.Auction?.userId !== userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      // delete the lot
      await db.lot.delete({ where: { id: input.id } });

      // update the lot numbers
      await db.lot.updateMany({
        where: {
          auctionId: lot.Auction!.id,
          lotNumber: {
            gt: lot.lotNumber,
          },
        },
        data: {
          lotNumber: {
            decrement: 1,
          },
        },
      });

      // delete images from s3
      await deleteImagesFromS3(lot.LotImage);
      return lot;
    }),

  createStripeSession: privateUserProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl("/dashboard/billing");

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Admin")?.price.priceIds
            .test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),

  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const getBase64 = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
    const buffer = await res.arrayBuffer();
    const { base64 } = await getPlaiceholder(Buffer.from(buffer));
    return base64;
  } catch (e) {
    if (e instanceof Error) console.log(e.stack);
  }
};
