import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateAdminProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

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

  // getSignedURL: privateAdminProcedure.mutation(async () => {
  //   return { success: { url: "" } };
  // }),

  // the following procedure implements polling
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

  deleteAuction: privateAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const auction = await db.auction.findFirst({
        where: { id: input.id, userId },
      });

      if (!auction) throw new TRPCError({ code: "NOT_FOUND" });

      await db.auction.delete({ where: { id: input.id } });

      return auction;
    }),
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
