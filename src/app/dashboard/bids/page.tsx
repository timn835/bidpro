import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { USDollar } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const page = async () => {
  // make sure you have a user
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect("auth-callback?origin=dashboard/bids");

  const bids = await db.bid.findMany({
    where: {
      userId: user.id,
    },
    include: {
      Lot: {
        select: {
          id: true,
          title: true,
          description: true,
          mainImgUrl: true,
          topBidId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      {bids.map((bid) => (
        <Card key={bid.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-x-4">
              {bid.Lot?.title}
              <Button variant="secondary">
                <Link href={`/lots/${bid.Lot?.id}`}>View Lot</Link>
              </Button>
            </CardTitle>
            <CardDescription>{bid.Lot?.description}</CardDescription>
          </CardHeader>
          <CardContent className="gap-y-2">
            <p>
              <span className="font-semibold">Bid placed on: </span>
              {format(bid.createdAt, "PPPPpppp")}
            </p>
            <p>
              <span className="font-semibold">Bid amount: </span>
              {USDollar.format(bid.amount)}
            </p>
            <p>
              <span className="font-semibold flex">
                Leading bid:{" "}
                {bid.Lot?.topBidId === bid.id ? (
                  <CheckCircle className="ml-2 bg-green-500 rounded-full" />
                ) : (
                  <XCircle className="ml-2 bg-red-500 rounded-full" />
                )}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default page;
