"use client";

import UploadImageButton from "@/components/action_buttons/UploadImageButton";
import UpdateAuctionButton from "@/components/action_buttons/UpdateAuctionButton";
import { format } from "date-fns";
import Image from "next/image";
import DeleteAuctionButton from "@/components/action_buttons/DeleteAuctionButton";
import CreateLotButton from "@/components/action_buttons/CreateLotButton";
import { type Auction } from "@prisma/client";
import { trpc } from "@/app/_trpc/client";
import { Loader2, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import AuctionDashboardLotCard from "../AuctionDashboardLotCard";

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
                <CreateLotButton
                  auctionId={auction.id}
                  disabled={auction.startsAt.getTime() < new Date().getTime()}
                />
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
                        <AuctionDashboardLotCard lot={lot} key={lot.id}>
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
