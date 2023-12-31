import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import AuctionDashboard from "@/components/dashboards/AuctionDashboard";

type PageProps = {
  params: {
    auctionId: string;
  };
};

const Page = async ({ params }: PageProps) => {
  // retrieve auction id
  const { auctionId } = params;

  // make sure you have a user
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id)
    redirect(`auth-callback?origin=dashboard/auctions/${auctionId}`);

  const auction = await db.auction.findFirst({
    where: { id: auctionId, userId: user.id },
    include: {
      _count: {
        select: {
          Lot: true,
        },
      },
    },
  });

  if (!auction) return notFound();

  return <AuctionDashboard auction={auction} numOfLots={auction._count.Lot} />;
};

export default Page;
