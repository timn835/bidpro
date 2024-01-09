import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { HistoryIcon, WrenchIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
const page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  return (
    <div>
      {dbUser.role === "ADMIN" ? (
        <Link href="/dashboard/auctions">
          <Card className="text-center m-4 overflow-hidden rounded-xl bg-white hover:shadow-lg transition hover:cursor-pointer flex items-center justify-around divide-x-2">
            <CardHeader className="flex-1">
              <CardTitle className="flex justify-center items-center">
                <WrenchIcon
                  size={50}
                  className="m-4 text-zinc-600 hidden md:block"
                />
                Manage your Auctions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex justify-center pt-6">
              <p>
                Create, update or delete auctions, add lots to your existing
                auctions, view auction bids and more!
              </p>
            </CardContent>
          </Card>
        </Link>
      ) : null}
      <Link href="/dashboard/bids">
        <Card className="text-center m-4 overflow-hidden rounded-xl bg-white hover:shadow-lg transition hover:cursor-pointer flex items-center justify-around divide-x-2">
          <CardHeader className="flex-1">
            <CardTitle className="flex justify-center items-center">
              <HistoryIcon
                size={50}
                className="m-4 text-zinc-600 hidden md:block"
              />
              View your Bids
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex justify-center pt-6">
            <p>
              View your past bids, see which bids are leading and which lots you
              have won.
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default page;
