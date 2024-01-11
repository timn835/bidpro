"use client";

import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Image from "next/image";
import { CheckCircle, InfoIcon, XCircle } from "lucide-react";
import { USDollar, cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type LotsWithBidsFeedProps = {
  auctionId: string;
};
const LotsWithBidsFeed = ({ auctionId }: LotsWithBidsFeedProps) => {
  const {
    data: lots,
    isLoading,
    isError,
  } = trpc.getLotsWithBids.useQuery({ auctionId });

  if (isError)
    return (
      <div className="mt-16 flex flex-col items-center gap-2 bg-red-100 text-red-400 rounded-md">
        <h3 className="font-semibold text-xl">
          Something went wrong while fetching the bids for your lots.
        </h3>
        <p>Please try again later</p>
      </div>
    );
  if (isLoading) return <Skeleton height={100} className="my-2" count={3} />;
  if (lots && lots.length === 0)
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <h3 className="font-semibold text-xl">
          There are no lots on which bids have been placed.
        </h3>
      </div>
    );
  return (
    <div className="mt-8 divide-y divide-zinc-200">
      {lots.map((lot) => (
        <Accordion key={lot.id} type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="relative h-16 w-16">
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
              <div>
                Lot #{lot.lotNumber}: {lot.title}
              </div>
              {lot._count.Bid > 5 ? (
                <TooltipProvider>
                  <div className="hidden md:block">
                    Total number of bids: {lot._count.Bid}
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="cursor-default ml-1.5">
                        <InfoIcon className="h-6 w-6 text-zinc-500" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        Only the top 5 bids are shown
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              ) : (
                <div className="hidden md:block">
                  Total number of bids: {lot._count.Bid}
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="text-center">
              <Table>
                <TableBody>
                  {lot.Bid.map((bid, i) => (
                    <TableRow key={bid.id}>
                      <TableCell className="flex">
                        {i === 0 ? (
                          <CheckCircle className="hidden md:block mr-2 bg-green-500 rounded-full w-5 h-5" />
                        ) : (
                          <XCircle className="hidden md:block mr-2 bg-red-500 rounded-full w-5 h-5" />
                        )}

                        {bid.User
                          ? `${bid.User.firstName} ${bid.User.lastName}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn("ml-2 font-semibold", {
                            "text-green-500": i === 0,
                          })}
                        >
                          {USDollar.format(bid.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {bid.User ? bid.User.email : "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default LotsWithBidsFeed;
