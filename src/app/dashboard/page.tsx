import AdminDashboard from "@/components/dashboards/AdminDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      <Link href="/dashboard/auctions">
        <Card className="text-center m-4 overflow-hidden rounded-xl bg-white hover:shadow-lg hover:cursor-pointer flex items-center justify-around divide-x-2">
          <CardHeader>
            <CardTitle className="flex justify-center">
              View Your Auctions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pt-6">
            <p>
              Manage your auctions, add lots to your existing auctions and more!
            </p>
          </CardContent>
        </Card>
      </Link>
      {dbUser.role === "ADMIN" ? (
        <div>Dashboard Card to lead to administer auctions</div>
      ) : null}
      {dbUser.role === "ADMIN" ? (
        <div>Dashboard Card to lead to administer bids</div>
      ) : null}
      <div>Dashboard card to lead to user bid history</div>
    </div>
  );

  // if (dbUser.role === "ADMIN") return <AdminDashboard />;
  // return <UserDashboard />;
};

export default page;
