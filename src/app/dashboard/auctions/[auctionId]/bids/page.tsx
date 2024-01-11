import LotsWithBidsFeed from "@/components/LotsWithBidsFeed";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

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
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          Lot: true,
        },
      },
    },
  });

  if (!auction) return notFound();
  return (
    <main className="max-w-7xl md:p-10 mx-3 md:mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 text-center">
        Bids for your auction: &quot;{auction.title}&quot;
      </h1>
      <LotsWithBidsFeed auctionId={auctionId} />
    </main>
  );
};

export default Page;
