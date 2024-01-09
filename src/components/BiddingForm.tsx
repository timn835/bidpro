import { TUpdateLotSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "./ui/form";
import { Input } from "./ui/input";
import Image from "next/image";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { USDollar } from "@/lib/utils";

type BiddingFormProps = {
  lotId: string;
  lotTitle: string;
  lotNumber: number;
  minBid: number;
  numOfBids: number;
  visitorId: string;
  imgUrl: string;
};

const BiddingForm = ({
  lotId,
  lotTitle,
  lotNumber,
  minBid,
  numOfBids,
  visitorId,
  imgUrl,
}: BiddingFormProps) => {
  const [serverError, setServerError] = useState<string>("");
  const bidSchema = z.object({
    lotId: z.string().min(1, "A lot id is required."),
    visitorId: z.string().min(1, "A visitor id is required"),
    bidAmount: z
      .number({ invalid_type_error: "Your bid must be a number" })
      .min(minBid, "Your bid is too small.")
      .max(minBid + 1000, "Your bid is too high."),
  });

  type TBidSchema = z.infer<typeof bidSchema>;

  const form = useForm<TBidSchema>({
    resolver: zodResolver(bidSchema),
  });

  useEffect(() => {
    form.setValue("lotId", lotId);
    form.setValue("bidAmount", minBid);
    form.setValue("visitorId", visitorId);
  }, [lotId, minBid, visitorId, form]);

  const onSubmit = (data: TBidSchema) => {
    setServerError("");
    console.log(data);
  };

  return (
    <div className="w-full mx-auto min-h-[60vh]">
      <div className="flex">
        <div className="m-5 relative h-44 w-44">
          <Image
            src={imgUrl}
            alt="lot-image"
            fill
            style={{ objectFit: "cover" }}
            sizes={"200px"}
            className="rounded-full"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col items-start justify-around text-xl">
          <p className="font-semibold">Lot #{lotNumber}</p>
          <p>
            <span className="font-semibold mr-2">Title:</span>
            {lotTitle}
          </p>
          <p>
            <span className="font-semibold mr-2">Number of bids:</span>
            {numOfBids}
          </p>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="bidAmount"
            >
              Your bid
            </label>
            <Input
              {...form.register("bidAmount", {
                valueAsNumber: true,
                value: minBid,
              })}
              className="remove-arrow"
              id="bidAmount"
              type="number"
              step=".01"
              onBlur={() =>
                form.setValue(
                  "bidAmount",
                  Number(Number(form.getValues().bidAmount).toFixed(2))
                )
              }
            />
            {form.formState.errors.bidAmount && (
              <p className="text-red-500">
                {form.formState.errors.bidAmount.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            {serverError && <p className="text-red-500">{serverError}</p>}
          </div>
          <div className="flex items-center justify-center mt-8">
            <Button
              //   className="w-full"
              size="lg"
              type="submit"
              aria-label="proceed to placing the bid"
            >
              <div className="text-[18px]">
                {false ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  "Place your Bid!"
                )}
              </div>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BiddingForm;
