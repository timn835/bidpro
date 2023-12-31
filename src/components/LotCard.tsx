import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { USDollar, calcRemainingTime } from "@/lib/utils";
import Link from "next/link";

type LotCardProps = {
  lot: {
    id: string;
    title: string;
    description: string;
    category: string;
    minBid: number;
    lotNumber: number;
    mainImgUrl: string | null;
    _count: { Bid: number };
    Auction: {
      endsAt: Date;
    } | null;
  };
  blurImgUrl: string;
};

const LotCard = ({ lot, blurImgUrl }: LotCardProps) => {
  const formattedMinBid = USDollar.format(lot.minBid);
  return (
    <Card className="overflow-hidden rounded-xl bg-white shadow-lg flex flex-col justify-between max-w-[250px] h-[530px]">
      <CardContent className="p-6 flex flex-col items-center">
        <CardTitle className="text-2xl font-semibold text-center">
          <p>{`Lot #${lot.lotNumber}`}</p>
          <p>{`${lot.title}`}</p>
        </CardTitle>
        <Link href={`/lots/${lot.id}`}>
          <div className="m-5 relative h-44 w-44">
            <Image
              src={lot.mainImgUrl ? lot.mainImgUrl : "/standard-lot.jpg"}
              alt="lot-image"
              fill
              style={{ objectFit: "cover" }}
              sizes={"200px"}
              className="rounded-full"
              placeholder="blur"
              blurDataURL={blurImgUrl}
              loading="lazy"
            />
          </div>
        </Link>
        {/* <CardDescription className="mb-4 text-zinc-600 max-h-20 overflow-auto">
          {lot.description}
        </CardDescription> */}
        <p className="text-zinc-600">
          Minimum bid:
          <span className="pl-2 font-semibold text-zinc-900">
            {formattedMinBid}
          </span>
        </p>
        <p className="text-zinc-600">
          Number of bids:
          <span className="pl-2 font-semibold text-zinc-900">
            {lot._count.Bid}
          </span>
        </p>
        <p className="text-zinc-600">Time remaining:</p>
        <p className="font-semibold text-zinc-900 text-center">
          {calcRemainingTime(lot.Auction?.endsAt.toISOString(), lot.lotNumber)}
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-zinc-900">
        <Button size="lg" className="w-full">
          Bid {formattedMinBid}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LotCard;
