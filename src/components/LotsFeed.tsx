import { PageProps } from "@/app/auctions/[auctionId]/page";
import { db } from "@/db";
import LotCard from "./LotCard";
import { notFound } from "next/navigation";
import { getBase64 } from "@/trpc";
import Pagination from "./Pagination";
import { revalidatePath } from "next/cache";

export type fetchLotsFeedReturnType = typeof fetchLotsFeed;

const PAGE_SIZE = 10;

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
      auctionId: auctionId,
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

  const total = await db.lot.count({
    where: {
      auctionId,
    },
  });

  revalidatePath(`/auctions/${auctionId}`);

  return {
    data: { lots, blurImgUrls },
    metadata: {
      hasNextPage: skip + take < total,
      totalPages: Math.ceil(total / take),
    },
  };
};

const LotsFeed = async ({ params, searchParams }: PageProps) => {
  const pageNumber = Number(searchParams?.page || 1); // Get the page number. Default to 1 if not provided.
  const take = PAGE_SIZE;
  const skip = (pageNumber - 1) * take;
  const auctionId = params.auctionId;

  if (typeof auctionId !== "string") {
    return notFound();
  }

  const { data, metadata } = await fetchLotsFeed({ auctionId, take, skip });

  return (
    <div className="space-y-6 p-6">
      <Pagination {...searchParams} {...metadata} />
      <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data.lots.map((lot, idx) => (
          <LotCard key={lot.id} lot={lot} blurImgUrl={data.blurImgUrls[idx]!} />
        ))}
      </div>
    </div>
  );
};

export default LotsFeed;
