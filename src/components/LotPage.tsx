"use client";

import { Button } from "./ui/button";

type LotPageProps = {
  lotId: string;
  lotOwnerId?: string;
};

const LotPage = ({ lotId, lotOwnerId }: LotPageProps) => {
  return (
    <div className="flex flex-col justify-center p-4 gap-y-5">
      <div className="w-full p-2 rounded-md bg-white">
        <h1 className="text-wrap text-3xl font-semibold">
          Lot#3:cccccccccccccccccccccccccccccccllllllllllllllllll;;;;;;;;;;;;;;;;;;;;;;;;
        </h1>
      </div>
      <div className="w-full p-2 rounded-md bg-white h-[50vh]">
        Image slider
      </div>
      <div className="w-full p-2 rounded-md bg-white flex flex-col items-center">
        <p>
          <span className="font-bold">Highest bid:</span> 12$
        </p>
        <p>
          <span className="font-bold">Time remaining:</span> 5d 6h 11m
        </p>
        <p>
          <span className="font-bold">Highest bid:</span> 12$
        </p>
      </div>
      <div className="w-full p-2 rounded-md gap-2 bg-white flex flex-wrap justify-around">
        {lotOwnerId ? (
          <>
            <Button>Update Lot</Button>
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
          <p className="text-wrap min-w-[50%]">5</p>
        </div>
        <div className="flex">
          <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%]">
            Category:
          </p>
          <p className="text-wrap min-w-[50%]">Jewelry</p>
        </div>
        <div className="flex">
          <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%]">Title:</p>
          <p className="text-wrap min-w-[50%]">
            cccccccccccccccccccccccccccccccllllllllllllllllll;;;;;;;;;;;;;;;;;;;;;;;;
          </p>
        </div>
        <div className="flex">
          <p className="pl-2 mr-2 bg-gray-300 font-bold min-w-[50%] rounded-b-md">
            Description:
          </p>
          <p className="text-wrap min-w-[50%]">
            blablablablalblalllllllllllllllllllllllllllllllllllllllaaaaaaaaaakkkkkkkkkkkkkkk
          </p>
        </div>
      </div>
    </div>
  );
};

export default LotPage;
