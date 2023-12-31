import AuctionHeader from "@/components/AuctionHeader";
import LotsFeed from "@/components/LotsFeed";
import { db } from "@/db";
import { getBase64 } from "@/trpc";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

const fetchAuctionInfo = async (auctionId: string) => {
  const auction = await db.auction.findFirst({
    where: {
      id: auctionId,
    },
    include: {
      _count: {
        select: {
          Lot: true,
        },
      },
    },
  });

  // fetch blur image
  const blurImgUrl = auction?.imgUrl
    ? await getBase64(auction.imgUrl)
    : "/standard-auction-small.jpg";
  return { auction, blurImgUrl };
};

const Page = async (props: PageProps) => {
  const auctionId = props.params.auctionId;
  if (typeof auctionId !== "string") return notFound();

  const { auction, blurImgUrl } = await fetchAuctionInfo(auctionId);
  if (!auction) return notFound();
  return (
    <main>
      <Suspense fallback={<Skeleton height={100} className="my-2" count={1} />}>
        <AuctionHeader auction={auction} blurImgUrl={blurImgUrl!} />
      </Suspense>
      <Suspense fallback={<Skeleton height={100} className="my-2" count={3} />}>
        <LotsFeed {...props} />
      </Suspense>
    </main>
  );
};

export default Page;
