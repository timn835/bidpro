"use client";

import UploadImageButton from "@/components/UploadImageButton";
import UpdateAuctionButton from "@/components/UpdateAuctionButton";
import { format } from "date-fns";
import Image from "next/image";
import DeleteAuctionButton from "@/components/DeleteAuctionButton";
import CreateLotButton from "@/components/CreateLotButton";
import { type Auction } from "@prisma/client";
import { trpc } from "@/app/_trpc/client";
import Link from "next/link";
import { Gavel, Loader2, Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

type AuctionDashboardProps = {
  auction: Auction;
};
const AuctionDashboard = ({ auction }: AuctionDashboardProps) => {
  const [currentlyDeletingLot, setCurrentlyDeletingLot] = useState<
    string | null
  >(null);
  const utils = trpc.useUtils();
  const { data: lots, isLoading: areLotsLoading } =
    trpc.getAuctionLots.useQuery({ auctionId: auction.id });

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
                <CreateLotButton auctionId={auction.id} />
              </div>
              <div className="max-h-[70vh] overflow-auto">
                {/* display auction lots */}
                {lots && lots.length > 0 ? (
                  <ul className="mt-8 flex flex-col gap-6 divide-y divide-zinc-200">
                    {lots
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((lot) => (
                        <li
                          key={lot.id}
                          className="m-3 col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg flex flex-col justify-between"
                        >
                          <Link
                            className="flex flex-col gap-2"
                            href={`/dashboard/lots/${lot.id}`}
                          >
                            <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                              <div className="relative h-36 w-36">
                                <Image
                                  src={
                                    lot.mainImgUrl
                                      ? lot.mainImgUrl
                                      : "/standard-lot.jpg"
                                  }
                                  alt="auction-image"
                                  fill
                                  style={{ objectFit: "cover" }}
                                  sizes={"100px"}
                                  // objectPosition="top"
                                  // width={100}
                                  // height={100}
                                  className="rounded-full"
                                />
                              </div>

                              <div className="flex-1 overflow-auto">
                                <div className="flex flex-col space-y-2 items-center">
                                  <h3 className=" text-xl font-medium text-gray-900">
                                    {lot.title}
                                  </h3>
                                  <div>
                                    <p>
                                      <span className="font-semibold">
                                        Description:{" "}
                                      </span>
                                      {lot.description}
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
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : areLotsLoading ? (
                  <div className="flex justify-center items-center h-[90vh]">
                    <Loader2 className="h-48 w-48 animate-spin text-zinc-300" />
                  </div>
                ) : (
                  <div className="mt-16 flex flex-col items-center gap-2">
                    <h3 className="font-semibold text-xl">
                      This auction does not have any lots at the moment.
                    </h3>
                    <p>Create your first one!</p>
                  </div>
                )}
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
