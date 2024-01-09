import React, { useState } from "react";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { USDollar, calcRemainingTime } from "@/lib/utils";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import BiddingForm from "./BiddingForm";
import { CheckCircle } from "lucide-react";

type LotCardProps = {
  lot: {
    id: string;
    title: string;
    description: string;
    category: string;
    minBid: number;
    topBidderId: string | null;
    lotNumber: number;
    mainImgUrl: string | null;
    _count: { Bid: number };
    Auction: {
      endsAt: string;
    } | null;
  };
  disableBid: boolean;
  visitorId: string;
  pathname: string;
};

const LotCard = ({ lot, disableBid, visitorId, pathname }: LotCardProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const formattedMinBid = USDollar.format(lot.minBid);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
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
                loading="lazy"
              />
            </div>
          </Link>
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
            {calcRemainingTime(lot.Auction?.endsAt, lot.lotNumber)}
          </p>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-zinc-900">
          {lot.topBidderId !== null && visitorId === lot.topBidderId ? (
            <Button
              size="lg"
              className="w-full bg-green-500 hover:bg-green-500 hover:cursor-default"
            >
              <CheckCircle />
            </Button>
          ) : visitorId === "" ? (
            <LoginLink postLoginRedirectURL={pathname} className="w-full">
              <Button size="lg" className="w-full">
                Bid {formattedMinBid}
              </Button>
            </LoginLink>
          ) : (
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
              <Button size="lg" className="w-full" disabled={disableBid}>
                Bid {formattedMinBid}
              </Button>
            </DialogTrigger>
          )}
        </CardFooter>
      </Card>
      <DialogContent>
        {visitorId === "" ? (
          <div>You need to sign in before you bid</div>
        ) : (
          <BiddingForm
            lotId={lot.id}
            lotTitle={lot.title}
            lotNumber={lot.lotNumber}
            numOfBids={lot._count.Bid}
            minBid={lot.minBid}
            imgUrl={lot.mainImgUrl ? lot.mainImgUrl : "/standard-lot.jpg"}
            setIsOpen={setIsOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LotCard;
