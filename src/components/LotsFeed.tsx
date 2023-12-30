import { PageProps } from "@/app/auctions/[auctionId]/page";
import { db } from "@/db";
import LotCard from "./LotCard";

export type fetchLotsFeedReturnType = typeof fetchLotsFeed;

const fetchLotsFeed = async ({ take = 0, skip = 0 }) => {
  const lots = await db.lot.findMany({
    take,
    skip,
    orderBy: {
      lotNumber: "asc",
    },
  });

  const total = await db.lot.count();

  return {
    data: lots,
    metadata: {
      hasNextPage: skip + take < total,
      totalPages: Math.ceil(total / take),
    },
  };
};

const LotsFeed = (props: PageProps) => {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <LotCard key={idx} />
        ))}
      </div>
    </div>
  );
};

export default LotsFeed;
