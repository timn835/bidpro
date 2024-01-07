"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import LotCard from "./LotCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";

type LotsFeedProps = {
  auctionId: string;
  visitorId: string;
  numOfLots: number;
  disableBid: boolean;
};

const LotsFeed = ({
  visitorId,
  auctionId,
  numOfLots,
  disableBid = false,
}: LotsFeedProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  let pageNumber = 1;
  const page = searchParams.get("page");
  if (page && !isNaN(Number(page))) pageNumber = Number(page);

  let lotsPerPage = 10;
  const quantity = searchParams.get("quantity");
  if (quantity && !isNaN(Number(quantity))) lotsPerPage = Number(quantity);

  let totalPages = Math.ceil(numOfLots / lotsPerPage);

  const {
    data: lots,
    isLoading: areLotsLoading,
    isError,
  } = trpc.getPublicAuctionLots.useQuery({
    auctionId,
    lotsPerPage,
    pageNumber,
  });

  if (areLotsLoading)
    return <Skeleton height={"60vh"} className="my-2" count={3} />;

  if (isError)
    return (
      <div className="mt-16 flex flex-col items-center gap-2 bg-red-100 text-red-400 rounded-md">
        <h3 className="font-semibold text-xl">
          Something went wrong while fetching the lots.
        </h3>
        <p>Please try again later</p>
      </div>
    );

  if (lots && lots.length === 0) return;
  <div className="mt-16 flex flex-col items-center gap-2">
    <h3 className="font-semibold text-xl">
      The auctioneer has yet to upload any lots.
    </h3>
    <p>Please come back soon!</p>
  </div>;

  return (
    <div className="space-y-6 p-6">
      <div className="w-full flex flex-col md:flex-row items-center md:justify-end gap-3">
        <Label htmlFor="quantity">Lots per page</Label>
        <Select
          onValueChange={(e) => {
            if (lotsPerPage === Number(e)) return;
            router.push(`/auctions/${auctionId}?page=1&quantity=${e}`);
          }}
          defaultValue={`${lotsPerPage}`}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Lots per page" />
          </SelectTrigger>
          <SelectContent id="quantity">
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
        <Pagination>
          <PaginationContent>
            {pageNumber !== 1 ? (
              <PaginationItem>
                <PaginationPrevious
                  href={`/auctions/${auctionId}/?page=${
                    pageNumber - 1
                  }&quantity=${lotsPerPage}`}
                />
              </PaginationItem>
            ) : null}
            {pageNumber - 1 > 1 ? (
              <PaginationItem>
                <PaginationLink
                  href={`/auctions/${auctionId}/?page=1&quantity=${lotsPerPage}`}
                >
                  <PaginationEllipsis />
                </PaginationLink>
              </PaginationItem>
            ) : null}
            {pageNumber > 1 ? (
              <PaginationItem>
                <PaginationLink
                  href={`/auctions/${auctionId}/?page=${
                    pageNumber - 1
                  }&quantity=${lotsPerPage}`}
                >
                  {pageNumber - 1}
                </PaginationLink>
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
            {pageNumber < totalPages ? (
              <PaginationItem>
                <PaginationLink
                  href={`/auctions/${auctionId}/?page=${
                    pageNumber + 1
                  }&quantity=${lotsPerPage}`}
                >
                  {pageNumber + 1}
                </PaginationLink>
              </PaginationItem>
            ) : null}
            {totalPages - pageNumber > 1 ? (
              <PaginationItem>
                <PaginationLink
                  href={`/auctions/${auctionId}/?page=${totalPages}&quantity=${lotsPerPage}`}
                >
                  <PaginationEllipsis />
                </PaginationLink>
              </PaginationItem>
            ) : null}
            {pageNumber < totalPages ? (
              <PaginationItem>
                <PaginationNext
                  href={`/auctions/${auctionId}/?page=${
                    pageNumber + 1
                  }&quantity=${lotsPerPage}`}
                />
              </PaginationItem>
            ) : null}
          </PaginationContent>
        </Pagination>
      </div>
      <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {lots.map((lot, idx) => (
          <LotCard key={lot.id} lot={lot} disableBid={disableBid} />
        ))}
      </div>
    </div>
  );
};

export default LotsFeed;
