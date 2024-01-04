"use client";

import UploadImageButton from "@/components/action_buttons/UploadImageButton";
import UpdateAuctionButton from "@/components/action_buttons/UpdateAuctionButton";
import { format } from "date-fns";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import DeleteAuctionButton from "@/components/action_buttons/DeleteAuctionButton";
import CreateLotButton from "@/components/action_buttons/CreateLotButton";
import { type Auction } from "@prisma/client";
import { trpc } from "@/app/_trpc/client";
import { Loader2, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Fragment, useEffect, useState } from "react";
import AuctionDashboardLotCard from "../AuctionDashboardLotCard";
import { INFINITE_QUERY_LIMIT } from "@/lib/constants";

type AuctionDashboardProps = {
  auction: Auction;
};

const AuctionDashboard = ({ auction }: AuctionDashboardProps) => {
  const { ref, inView } = useInView();
  const [currentlyDeletingLot, setCurrentlyDeletingLot] = useState<
    string | null
  >(null);
  const utils = trpc.useUtils();

  const { mutate: deleteLot } = trpc.deleteLot.useMutation({
    onSuccess: () => {
      utils.getAuctionLots.invalidate();
    },
    onMutate: ({ id }) => {
      setCurrentlyDeletingLot(id);
    },
    onSettled: () => {
      setCurrentlyDeletingLot(null);
    },
  });

  const {
    data,
    isLoading: areLotsLoading,
    isError: isErrorLoadingLots,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.getAuctionLots.useInfiniteQuery(
    {
      auctionId: auction.id,
      limit: INFINITE_QUERY_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      // keepPreviousData: true,
      retry: false,
    }
  );

  const lots = data?.pages.flatMap((page) => page.lots);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <div className="flex flex-col md:flex-row justify-around bg-white rounded-md flex-wrap">
              <div className="flex flex-col items-center mb-4">
                <h1 className="font-bold text-xl p-5">{auction.title}</h1>
                <div className="relative h-80 w-80 md:h-96 md:w-96">
                  <Image
                    src={
                      auction.imgUrl ? auction.imgUrl : "/standard-auction.jpg"
                    }
                    alt="auction-image"
                    fill
                    style={{ objectFit: "cover" }}
                    sizes={"500px"}
                    // objectPosition="top"
                    // width={100}
                    // height={100}
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="p-1 flex flex-col items-center md:items-start md:ml-4 justify-around">
                <div>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Location: </span>
                    {auction.location}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Starts on: </span>
                    {format(auction.startsAt, "Pp")}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Ends on: </span>
                    {format(auction.endsAt, "Pp")}
                  </p>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Total # of lots: </span>
                    {lots ? lots.length : 0}
                  </p>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Total # of bids: </span>
                    To be implemented...
                  </p>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Most popular lot: </span>
                    To be implemented...
                  </p>
                </div>
                <div className="border-b border-t border-zinc-200">
                  <div className="h-14 w-full flex items-center px-2 gap-x-4">
                    <UpdateAuctionButton auction={auction} />
                    <UploadImageButton auctionId={auction.id} />
                  </div>
                  <div className="h-14 w-full flex items-center justify-center px-2 gap-x-4">
                    <DeleteAuctionButton
                      auctionId={auction.id}
                      disabled={lots ? lots.length > 0 : false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end of left side */}

        {/* right side */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:pr-8 xl:pr-6">
          <div className="flex flex-col bg-white rounded-md">
            <div>
              <div className="w-full flex flex-wrap justify-between p-4 gap-x-4 border-b-2">
                <h1 className="font-bold text-xl">Lots registered</h1>
                <CreateLotButton
                  auctionId={auction.id}
                  disabled={auction.startsAt.getTime() < new Date().getTime()}
                />
              </div>
              <div className="max-h-[70vh] overflow-auto">
                {/* displaying auction lots */}

                {/* are the lots loading? */}
                {areLotsLoading && (
                  <div className="flex justify-center items-center h-[90vh]">
                    <Loader2 className="h-48 w-48 animate-spin text-zinc-300" />
                  </div>
                )}

                {/* was there an error loading the lots? */}
                {isErrorLoadingLots && (
                  <div className="mt-16 flex flex-col items-center gap-2 bg-red-100 text-red-400 rounded-md">
                    <h3 className="font-semibold text-xl">
                      Something went wrong while fetching the lots.
                    </h3>
                    <p>Please try again later</p>
                  </div>
                )}

                {/* do we not yet have any lots available? */}
                {lots && lots.length === 0 && (
                  <div className="mt-16 flex flex-col items-center gap-2">
                    <h3 className="font-semibold text-xl">
                      This auction does not have any lots at the moment.
                    </h3>
                    <p>Create your first one!</p>
                  </div>
                )}

                {/* display the lots you have with infinite scroll */}
                {data && lots && lots!.length > 0 && (
                  <ul className="mt-8 flex flex-col gap-6 divide-y divide-zinc-200">
                    {data.pages.map((page) => (
                      <Fragment key={page.nextCursor ?? "lastPage"}>
                        {page.lots.map((lot, i) => (
                          <AuctionDashboardLotCard
                            lot={lot}
                            // blurImgUrl={
                            //   page.blurImgUrls[i] ?? "/standard-lot-small.jpg"
                            // }
                            key={lot.id}
                          >
                            <Button
                              size="sm"
                              className="w-full"
                              variant="destructive"
                              onClick={() => {
                                deleteLot({ id: lot.id });
                              }}
                            >
                              {currentlyDeletingLot === lot.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </AuctionDashboardLotCard>
                        ))}
                      </Fragment>
                    ))}
                  </ul>
                )}

                {/* are we fetching next page? */}
                {isFetchingNextPage && (
                  <div className="w-full mt-4 max-w-xs mx-auto">
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-centr pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading...
                    </div>
                  </div>
                )}

                <span style={{ visibility: "hidden" }} ref={ref}>
                  intersection observer marker
                </span>

                {/* end of displaying auction lots */}
              </div>
            </div>
          </div>
        </div>

        {/* end of right side */}
      </div>
    </div>
  );
};

export default AuctionDashboard;
