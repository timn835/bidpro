import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";

const LotCard = () => {
  return (
    <Card className="overflow-hidden rounded-xl bg-white shadow-lg flex flex-col items-center">
      <div className="mt-5 relative h-44 w-44">
        <Image
          src="/standard-lot.jpg"
          alt="lot-image"
          fill
          style={{ objectFit: "cover" }}
          sizes={"100px"}
          className="rounded-full"
        />
      </div>
      <CardContent className="p-6">
        <CardTitle className="mb-2 text-2xl font-semibold">Lot title</CardTitle>
        <CardDescription className="mb-4 text-gray-700 dark:text-zinc-100">
          Lot description
        </CardDescription>
        <div className="mb-4">
          <span className="text-lg font-semibold">Price:</span>
          <span className="ml-2 text-2xl font-bold text-green-500">
            Formatted price
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-6 dark:bg-zinc-900">
        <Button size="lg" className="w-full">
          Bid $7.00
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LotCard;
