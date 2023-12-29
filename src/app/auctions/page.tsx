import AuctionsFeed from "@/components/AuctionsFeed";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";

const Page = async () => {
  return (
    <main className="max-w-7xl md:p-10 mx-3 md:mx-auto">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">
          Active Auctions
        </h1>
      </div>

      <Suspense fallback={<Skeleton height={100} className="my-2" count={3} />}>
        <AuctionsFeed />
      </Suspense>
    </main>
  );
};

export default Page;
