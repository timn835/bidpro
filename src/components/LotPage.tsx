"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "./ui/button";
import Skeleton from "react-loading-skeleton";
import { notFound } from "next/navigation";
import { USDollar, calcRemainingTime } from "@/lib/utils";
import ImageSlider from "./ImageSlider";
import UpdateLotButton from "./action_buttons/UpdateLotButton";

type LotPageProps = {
  lotId: string;
  lotOwnerId?: string;
};

const LotPage = ({ lotId, lotOwnerId }: LotPageProps) => {
  const {
    data: lot,
    isLoading: isLotLoading,
    refetch,
  } = trpc.getLot.useQuery({
    lotId,
  });

  if (isLotLoading)
    return <Skeleton height={"80vh"} className="my-2" count={1} />;

  if (!lot) return notFound();

  return (
    <div className="flex flex-col md:flex-row justify-center p-4 gap-y-5 md:items-center bg-white m-5">
      <div className="md:min-w-[50vw]">
        <div className="w-full p-2 rounded-md bg-white">
          <h1 className="text-wrap text-3xl font-semibold">
            Lot #{lot.lotNumber}: {lot.title}
          </h1>
        </div>
        <ImageSlider imgUrls={lot.LotImage.map((image) => image.imgUrl)} />
      </div>
      <div className="md:w-[50vw]">
        <div className="p-2 rounded-md bg-white flex flex-col items-center">
          <div className="divide-y-2">
            <p>
              <span className="font-bold mr-2">Time remaining:</span>
              {calcRemainingTime(lot.Auction?.endsAt, lot.lotNumber)}
            </p>
            <p>
              <span className="font-bold mr-2">Number of bids: </span>
              {lot._count.Bid}
            </p>
            <p>
              <span className="font-bold mr-2">Minimum bid:</span>{" "}
              {USDollar.format(lot.minBid)}
            </p>
          </div>
        </div>
        <div className="p-2 rounded-md gap-2 bg-white flex flex-wrap justify-around">
          {lotOwnerId ? (
            <>
              <UpdateLotButton lot={lot} refetch={refetch} />
              <Button>Update Images</Button>
              <Button variant="destructive" className="hover:bg-red-100">
                Delete Lot
              </Button>
            </>
          ) : (
            <Button>Bid</Button>
          )}
        </div>
        <div className="w-full p-2 rounded-md gap-2 bg-white divide-y-2">
          <h1 className="pl-2 mb-4 text-xl text-semibold text-center">
            Lot Information
          </h1>
          <div className="flex">
            <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%] rounded-t-md">
              Lot #:
            </p>
            <p className="text-wrap min-w-[50%]">{lot.lotNumber}</p>
          </div>
          <div className="flex">
            <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%]">
              Category:
            </p>
            <p className="text-wrap min-w-[50%]">{lot.category}</p>
          </div>
          <div className="flex">
            <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%]">
              Title:
            </p>
            <p className="text-wrap min-w-[50%]">{lot.title}</p>
          </div>
          <div className="flex">
            <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%] rounded-b-md">
              Description:
            </p>
            <p className="text-wrap min-w-[50%]">{lot.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotPage;
