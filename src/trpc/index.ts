import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateAdminProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  createAuctionSchema,
  createLotSchema,
  updateAuctionSchema,
} from "@/lib/types";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || !user.id || !user.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

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
    const { userId, user } = ctx;

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
    .mutation(async ({ ctx, input }) => {
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
          region: process.env.AWS_BUCKET_REGION!,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
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
    .input(z.object({ auctionId: z.string() }))
    .query(async ({ input }) => {
      return await db.lot.findMany({
        where: {
          auctionId: input.auctionId,
        },
        include: {
          _count: {
            select: { Bid: true },
          },
        },
      });
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

      // make sure that there are less than 100 lots
      if (auction._count.Lot > 99) throw new TRPCError({ code: "BAD_REQUEST" });

      // create the lot
      const newLot = await db.lot.create({
        data: {
          ...input,
          lotNumber: auction._count.Lot + 1,
        },
      });

      return newLot;
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
      const s3 = new S3Client({
        region: process.env.AWS_BUCKET_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
      const deleteImagePromises = lot.LotImage.map(async (image) => {
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.imgUrl.split("/").pop(),
        });
        await s3.send(deleteObjectCommand);
      });

      try {
        await Promise.all(deleteImagePromises);
      } catch (error) {
        console.log("unable to delete image from s3");
        console.error();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // delete images from the database
      const deleteImageDBPromises = lot.LotImage.map(async (image) => {
        await db.lotImage.delete({
          where: {
            id: image.id,
          },
        });
      });
      try {
        await Promise.all(deleteImageDBPromises);
      } catch (error) {
        console.log("unable to delete image from db");
        console.error();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return lot;
    }),

  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
