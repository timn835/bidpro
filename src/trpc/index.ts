import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateAdminProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createAuctionSchema } from "@/lib/types";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (!user.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

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

  deleteAuction: privateAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const auction = await db.auction.findFirst({
        where: { id: input.id, userId },
      });

      if (!auction) throw new TRPCError({ code: "NOT_FOUND" });

      // check if there are lots with this auctionId that exist

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
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
