"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { USDollar, calcRemainingTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, HelpCircle, InfoIcon, XCircle } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const UserBidsFeed = () => {
  const { data, isLoading, isError } = trpc.getBids.useQuery();
  const leadingBids = data?.leadingBids;
  const trailingBids = data?.trailingBids;
  const leaderNames = data?.leaderNames;

  if (isError)
    return (
      <div className="mt-16 flex flex-col items-center gap-2 bg-red-100 text-red-400 rounded-md">
        <h3 className="font-semibold text-xl">
          Something went wrong while fetching the bids.
        </h3>
        <p>Please try again later</p>
      </div>
    );

  return (
    <main className="max-w-7xl md:p-10 mx-3 md:mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 text-center">
        Your leading bids
      </h1>
      {isLoading ? <Skeleton height={100} className="my-2" count={3} /> : null}
      {leadingBids && leadingBids.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2">
          <h3 className="font-semibold text-xl">
            You do not have any leading bids at the moment.
          </h3>
        </div>
      ) : null}
      {leadingBids && leadingBids.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2">
          {leadingBids
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((bid) => (
              <Card key={bid.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between mb-4">
                    {bid.Lot?.title}
                    <Button variant="secondary">
                      <Link href={`/lots/${bid.Lot?.id}`}>View the Lot</Link>
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-zinc-600">
                    {bid.Lot?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="gap-y-2">
                  <p className="text-zinc-600">
                    Auction:{" "}
                    <span className="font-semibold text-zinc-900">
                      {bid.Lot?.Auction?.title}, Lot #{bid.Lot?.lotNumber}
                    </span>
                  </p>
                  <p className="text-zinc-600 flex">
                    Leading bid:{" "}
                    <CheckCircle className="ml-2 bg-green-500 rounded-full" />
                  </p>
                  <p className="text-zinc-600">
                    Bid placed on:{" "}
                    <span className="font-semibold text-zinc-900">
                      {format(new Date(bid.createdAt), "PPPPpppp")}
                    </span>
                  </p>
                  <p className="text-zinc-600">
                    Bid amount:{" "}
                    <span className="font-semibold text-zinc-900">
                      {USDollar.format(bid.amount)}
                    </span>
                  </p>
                  <p className="text-zinc-600">
                    Time remaining:{" "}
                    <span className="font-semibold text-zinc-900">
                      {calcRemainingTime(
                        bid.Lot?.Auction?.endsAt,
                        bid.Lot?.lotNumber ?? 1
                      )}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : null}

      <TooltipProvider>
        <h1 className="mt-8 text-4xl font-bold text-gray-900 text-center">
          Your trailing bids
          <Tooltip delayDuration={300}>
            <TooltipTrigger className="cursor-default ml-1.5">
              <InfoIcon className="h-7 w-7 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent className="w-80 p-2">
              Only your largest trailing bid for the lot is shown.
            </TooltipContent>
          </Tooltip>
        </h1>
      </TooltipProvider>
      {isLoading ? <Skeleton height={100} className="my-2" count={3} /> : null}
      {trailingBids && trailingBids.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-2">
          <h3 className="font-semibold text-xl">
            You do not have any trailing bids at the moment.
          </h3>
        </div>
      ) : null}
      {trailingBids && trailingBids.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2">
          {trailingBids
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((bid, i) => (
              <Card key={bid.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between mb-4">
                    {bid.Lot?.title}
                    <Button variant="secondary">
                      <Link href={`/lots/${bid.Lot?.id}`}>View the Lot</Link>
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-zinc-600">
                    {bid.Lot?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="gap-y-2">
                  <p className="text-zinc-600">
                    Auction:{" "}
                    <span className="font-semibold text-zinc-900">
                      {bid.Lot?.Auction?.title}, Lot #{bid.Lot?.lotNumber}
                    </span>
                  </p>
                  <p className="text-zinc-600 flex">
                    Leading bid:{" "}
                    <XCircle className="ml-2 bg-red-500 rounded-full" />
                  </p>
                  <p className="text-zinc-600 flex">
                    Leading bidder:{" "}
                    {leaderNames && i < leaderNames.length
                      ? leaderNames[i]
                      : "Unknown"}
                  </p>

                  <p className="text-zinc-600">
                    Bid placed on:{" "}
                    <span className="font-semibold text-zinc-900">
                      {format(new Date(bid.createdAt), "PPPPpppp")}
                    </span>
                  </p>
                  <p className="text-zinc-600">
                    Bid amount:{" "}
                    <span className="font-semibold text-zinc-900">
                      {USDollar.format(bid.amount)}
                    </span>
                  </p>
                  <p className="text-zinc-600">
                    Minimal bid required:{" "}
                    <span className="font-semibold text-zinc-900">
                      {bid.Lot?.minBid
                        ? USDollar.format(bid.Lot?.minBid)
                        : "Unknown"}
                    </span>
                  </p>
                  <p className="text-zinc-600">
                    Time remaining:{" "}
                    <span className="font-semibold text-zinc-900">
                      {calcRemainingTime(
                        bid.Lot?.Auction?.endsAt,
                        bid.Lot?.lotNumber ?? 1
                      )}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : null}
    </main>
  );
};

export default UserBidsFeed;
