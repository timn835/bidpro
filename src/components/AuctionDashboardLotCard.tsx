import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Gavel, Plus } from "lucide-react";
import { USDollar } from "@/lib/utils";
import { ReactNode } from "react";

type AuctionDashboardLotCardProps = {
  lot: Lot;
  // blurImgUrl: string;
  children: ReactNode;
};

type Lot = {
  id: string;
  title: string;
  description: string;
  category: string;
  minBid: number;
  lotNumber: number;
  createdAt: string;
  mainImgUrl: string | null;
  _count: { Bid: number };
};

const AuctionDashboardLotCard = ({
  lot,
  // blurImgUrl,
  children,
}: AuctionDashboardLotCardProps) => {
  return (
    <li
      key={lot.id}
      className="m-3 col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg flex flex-col justify-between"
    >
      <Link className="flex flex-col gap-2" href={`/lots/${lot.id}`}>
        <div className="pt-6 px-6 flex flex-col sm:flex-row w-full items-center justify-between space-x-6">
          <div className="relative h-36 w-36 mb-4 sm:mb-0">
            <Image
              src={lot.mainImgUrl ? lot.mainImgUrl : "/standard-lot.jpg"}
              alt="auction-image"
              fill
              style={{ objectFit: "cover" }}
              sizes={"200px"}
              className="rounded-full"
              // placeholder="blur"
              // blurDataURL={blurImgUrl}
            />
          </div>

          <div className="flex-1 overflow-auto">
            <div className="flex flex-col space-y-2 items-center">
              <h3 className=" text-xl font-medium text-gray-900">
                Lot #{lot.lotNumber}: {lot.title}
              </h3>
              <div className="hidden sm:block">
                <p>
                  <span className="font-semibold">Description: </span>
                  {lot.description}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Minimum bid: </span>
                  {USDollar.format(lot.minBid)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {format(new Date(lot.createdAt), "MMM yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Gavel className="h-4 w-4" />
          {lot._count.Bid} bids
        </div>
        {children}
      </div>
    </li>
  );
};

export default AuctionDashboardLotCard;
