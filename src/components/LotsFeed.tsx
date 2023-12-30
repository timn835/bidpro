import { PageProps } from "@/app/auctions/[auctionId]/page";
import { db } from "@/db";
import LotCard from "./LotCard";
import { notFound } from "next/navigation";
import { getBase64 } from "@/trpc";

export type fetchLotsFeedReturnType = typeof fetchLotsFeed;

const fetchLotsFeed = async ({
  auctionId,
  take = 10,
  skip = 0,
}: {
  auctionId: string;
  take?: number | undefined;
  skip?: number | undefined;
}) => {
  const lots = await db.lot.findMany({
    where: {
      auctionId,
    },
    include: {
      _count: {
        select: {
          Bid: true,
        },
      },
      Auction: {
        select: {
          endsAt: true,
        },
      },
    },
    take,
    skip,
    orderBy: {
      lotNumber: "asc",
    },
  });

  // get blur image urls
  const base64Promises = lots.map((lot) =>
    lot.mainImgUrl ? getBase64(lot.mainImgUrl) : "/standard-lot-small.jpg"
  );
  const blurImgUrls = await Promise.all(base64Promises);

  const total = await db.lot.count();

  return {
    data: { lots, blurImgUrls },
    metadata: {
      hasNextPage: skip + take < total,
      totalPages: Math.ceil(total / take),
    },
  };
};

const LotsFeed = async ({ params, searchParams }: PageProps) => {
  const auctionId = params.auctionId;
  if (typeof auctionId !== "string") {
    return notFound();
  }
  const { data } = await fetchLotsFeed({ auctionId });
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.lots.map((lot, idx) => (
          <LotCard key={lot.id} lot={lot} blurImgUrl={data.blurImgUrls[idx]!} />
        ))}
      </div>
    </div>
  );
};

export default LotsFeed;
