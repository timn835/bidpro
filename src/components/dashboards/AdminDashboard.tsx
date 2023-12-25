"use client";

import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { Layers3, Loader2, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useState } from "react";
import CreateNewAuctionButton from "../action_buttons/CreateNewAuctionButton";
import Image from "next/image";

const AdminDashboard = () => {
  const [currentlyDeletingAuction, setCurrentlyDeletingAuction] = useState<
    string | null
  >(null);

  const utils = trpc.useUtils();
  const { data: auctions, isLoading } = trpc.getUserAuctions.useQuery();
  const { mutate: deleteAuction } = trpc.deleteAuction.useMutation({
    onSuccess: () => {
      utils.getUserAuctions.invalidate();
    },
    onMutate: ({ id }) => {
      setCurrentlyDeletingAuction(id);
    },
    onSettled: () => {
      setCurrentlyDeletingAuction(null);
    },
  });

  return (
    <main className="max-w-7xl md:p-10 mx-3 md:mx-auto">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Auctions</h1>
        <CreateNewAuctionButton />
      </div>
      {/* Display all user auctions */}
      {auctions && auctions.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2">
          {auctions
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((auction) => (
              <li
                key={auction.id}
                className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg flex flex-col justify-between"
              >
                <Link
                  className="flex flex-col gap-2"
                  href={`/dashboard/auctions/${auction.id}`}
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="relative h-36 w-36">
                      <Image
                        src={
                          auction.imgUrl
                            ? auction.imgUrl
                            : "/standard-auction.jpg"
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
                      <div className="flex flex-col space-y-2">
                        <h3 className=" text-xl font-medium text-gray-900">
                          {auction.title}
                        </h3>
                        <div>
                          <p>
                            <span className="font-semibold">Location: </span>
                            {auction.location}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="font-semibold">Starts on: </span>
                            {format(new Date(auction.startsAt), "PPPP")}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="font-semibold">Ends on: </span>
                            {format(new Date(auction.endsAt), "PPPP")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {format(new Date(auction.createdAt), "MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4" />
                    {auction._count.Lot} lots
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    variant="destructive"
                    disabled={auction._count.Lot > 0}
                    onClick={() => {
                      deleteAuction({ id: auction.id });
                    }}
                  >
                    {currentlyDeletingAuction === auction.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <h3 className="font-semibold text-xl">
            You are not holding any auctions at the moment.
          </h3>
          <p>Let&apos;s create your first one!</p>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
