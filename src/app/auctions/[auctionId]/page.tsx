import { notFound } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import AuctionHeader from "@/components/AuctionHeader";
import LotsFeed from "@/components/LotsFeed";

type PageProps = {
  params: {
    auctionId: string;
  };
};

const Page = async ({ params }: PageProps) => {
  const { auctionId } = params;
  if (!auctionId) return notFound();

  const auction = await db.auction.findFirst({
    where: { id: auctionId },
    select: {
      id: true,
      title: true,
      location: true,
      startsAt: true,
      endsAt: true,
      imgUrl: true,
      User: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          Lot: true,
        },
      },
    },
  });
  if (!auction) return notFound();
  auction;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <main>
      <Suspense fallback={<Skeleton height={100} className="my-2" count={1} />}>
        <AuctionHeader auction={auction} />
      </Suspense>
      <LotsFeed
        auctionId={auction.id}
        visitorId={user?.id ?? ""}
        disableBids={user?.id === auction!.User!.id}
      />
    </main>
  );
};

export default Page;
