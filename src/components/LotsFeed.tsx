"use client";

import { trpc } from "@/app/_trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import LotCard from "./LotCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import { CATEGORIES } from "@/config/constants";

type LotsFeedProps = {
  auctionId: string;
  visitorId: string;
  disableBids: boolean;
};

const LotsFeed = ({
  visitorId,
  auctionId,
  disableBids = false,
}: LotsFeedProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  let pageNumber = 1;
  const page = searchParams.get("page");
  if (page && !isNaN(Number(page))) pageNumber = Number(page);

  let lotsPerPage = 10;
  const quantity = searchParams.get("quantity");
  if (quantity && !isNaN(Number(quantity))) lotsPerPage = Number(quantity);

  let catIdx: number | undefined;
  let category = searchParams.get("category");
  if (category && !isNaN(Number(category))) {
    let categoryAsNum = Number(category);
    if (categoryAsNum >= 0 && categoryAsNum < CATEGORIES.length) {
      catIdx = categoryAsNum;
    }
  }

  const pathname = `/auctions/${auctionId}?page=${pageNumber}&quantity=${lotsPerPage}${
    catIdx !== undefined ? `&category=${catIdx}` : ""
  }`;

  const {
    data,
    isLoading: areLotsLoading,
    isError,
  } = trpc.getPublicAuctionLots.useQuery({
    auctionId,
    lotsPerPage,
    pageNumber,
    catIdx,
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

  const { lots, numOfLots } = data;
  const totalPages = Math.ceil(numOfLots / lotsPerPage);

  if (lots && lots.length === 0)
    return (
      <div className="mt-16 flex flex-col items-center gap-2">
        <h3 className="font-semibold text-xl">No lots to display, sorry.</h3>
        <p>Please come back soon!</p>
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div className="w-full flex flex-col lg:flex-row items-center gap-3">
        <div className="flex items-center gap-1">
          <Label htmlFor="quantity">Lots per page</Label>
          <Select
            onValueChange={(e) => {
              if (lotsPerPage === Number(e)) return;
              router.push(
                `/auctions/${auctionId}?page=1&quantity=${e}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`
              );
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
        </div>
        <div className="flex items-center gap-1">
          <Label htmlFor="quantity">Category</Label>
          <Select
            onValueChange={(e) => {
              if (e === "all-categories")
                router.push(
                  `/auctions/${auctionId}?page=1&quantity=${lotsPerPage}`
                );
              const newCatIdx = CATEGORIES.findIndex((cat) => cat === e);
              if (newCatIdx === -1 || newCatIdx === catIdx) return;
              router.push(
                `/auctions/${auctionId}?page=1&quantity=${lotsPerPage}&category=${newCatIdx}`
              );
            }}
            defaultValue={catIdx !== undefined ? CATEGORIES[catIdx] : undefined}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent id="category">
              {catIdx ? (
                <SelectItem key="all-categories" value="all-categories">
                  Select All
                </SelectItem>
              ) : null}
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination>
          <PaginationContent>
            {pageNumber !== 1 ? (
              <PaginationPrevious
                href={`/auctions/${auctionId}/?page=${
                  pageNumber - 1
                }&quantity=${lotsPerPage}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`}
              />
            ) : null}
            {pageNumber - 1 > 1 ? (
              <PaginationLink
                href={`/auctions/${auctionId}/?page=1&quantity=${lotsPerPage}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`}
              >
                <PaginationEllipsis />
              </PaginationLink>
            ) : null}
            {pageNumber > 1 ? (
              <PaginationLink
                href={`/auctions/${auctionId}/?page=${
                  pageNumber - 1
                }&quantity=${lotsPerPage}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`}
              >
                {pageNumber - 1}
              </PaginationLink>
            ) : null}
            <PaginationLink href="#" isActive>
              {pageNumber}
            </PaginationLink>
            {pageNumber < totalPages ? (
              <PaginationLink
                href={`/auctions/${auctionId}/?page=${
                  pageNumber + 1
                }&quantity=${lotsPerPage}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`}
              >
                {pageNumber + 1}
              </PaginationLink>
            ) : null}
            {totalPages - pageNumber > 1 ? (
              <PaginationLink
                href={`/auctions/${auctionId}/?page=${totalPages}&quantity=${lotsPerPage}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`}
              >
                <PaginationEllipsis />
              </PaginationLink>
            ) : null}
            {pageNumber < totalPages ? (
              <PaginationNext
                href={`/auctions/${auctionId}/?page=${
                  pageNumber + 1
                }&quantity=${lotsPerPage}${
                  catIdx !== undefined ? `&category=${catIdx}` : ""
                }`}
              />
            ) : null}
          </PaginationContent>
        </Pagination>
      </div>
      <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {lots.map((lot) => (
          <LotCard
            key={lot.id}
            lot={lot}
            disableBid={disableBids}
            visitorId={visitorId}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
};

export default LotsFeed;
