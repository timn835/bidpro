import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

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

  getUserAuctions: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx;

    return await db.auction.findMany({
      where: {
        userId,
      },
    });
  }),
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
