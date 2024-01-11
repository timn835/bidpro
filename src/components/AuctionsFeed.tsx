import { db } from "@/db";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Layers3, Plus, UserCheck } from "lucide-react";

const fetchActiveAuctions = async () => {
  const auctions = await db.auction.findMany({
    where: {
      endsAt: {
        gte: new Date(),
      },
    },
    include: {
      _count: {
        select: {
          Lot: true,
        },
      },
      User: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      endsAt: "asc",
    },
  });
  return auctions;
};

const AuctionsFeed = async () => {
  const auctions = await fetchActiveAuctions();
  if (auctions.length === 0)
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <h3 className="font-semibold text-xl">
          There are no auctions currently being held.
        </h3>
      </div>
    );
  return (
    <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2">
      {auctions.map((auction) => (
        <li
          key={auction.id}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg flex flex-col justify-between"
        >
          <Link
            className="flex flex-col gap-2"
            href={`/auctions/${auction.id}`}
          >
            <div className="pt-6 px-6 flex flex-col sm:flex-row w-full items-center justify-between space-x-6">
              <div className="relative h-36 w-36 mb-4 sm:mb-0">
                <Image
                  src={
                    auction.imgUrl ? auction.imgUrl : "/standard-auction.jpg"
                  }
                  alt="auction-image"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes={"200px"}
                  className="rounded-full"
                />
              </div>

              <div className="flex-1 overflow-auto">
                <div className="flex flex-col space-y-2">
                  <h3 className=" text-xl font-medium text-gray-900">
                    {auction.title}
                  </h3>
                  <div>
                    <p>
                      <span className="font-semibold">Location: </span>
                      {auction.location}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">Starts on: </span>
                      {format(new Date(auction.startsAt), "PPPP")}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">Ends on: </span>
                      {format(new Date(auction.endsAt), "PPPP")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {format(new Date(auction.createdAt), "MMM yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4" />
              {auction._count.Lot} lots
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {auction.User?.email.split("@")[0]}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AuctionsFeed;
