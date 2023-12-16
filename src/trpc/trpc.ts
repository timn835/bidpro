import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});

const isAdmin = middleware(async (opts) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.role || dbUser.role !== "ADMIN")
    throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateUserProcedure = t.procedure.use(isAuth);
export const privateAdminProcedure = t.procedure.use(isAdmin);
