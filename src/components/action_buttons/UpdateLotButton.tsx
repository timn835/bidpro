"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type TUpdateLotSchema,
  updateLotSchema,
  CATEGORIES,
} from "@/lib/types";
import { Loader2 } from "lucide-react";

import { trpc } from "@/app/_trpc/client";

type Lot = {
  id: string;
  title: string;
  description: string;
  category: string;
  minBid: number;
  auctionId: string | null;
};

type UpdateLotButtonProps = {
  lot: Lot;
  refetch: () => void;
};

const UpdateLotButton = ({ lot, refetch }: UpdateLotButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>Update Lot</Button>
      </DialogTrigger>
      <DialogContent>
        <UpdateLotForm lot={lot} refetch={refetch} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateLotButton;

type UpdateLotFormProps = {
  lot: Lot;
  refetch: () => void;
  setIsOpen: (value: boolean) => void;
};

function UpdateLotForm({ lot, refetch, setIsOpen }: UpdateLotFormProps) {
  const [serverError, setServerError] = useState("");
  const { mutate: updateLot, isLoading: isLotUpdating } =
    trpc.updateLot.useMutation({
      onSuccess: () => {
        refetch();
        form.reset();
        setIsOpen(false);
      },
      onError: (err) => {
        setServerError("Something went wrong, please try again.");
      },
    });
  const form = useForm<TUpdateLotSchema>({
    resolver: zodResolver(updateLotSchema),
  });

  useEffect(() => {
    if (lot.auctionId) form.setValue("auctionId", lot.auctionId);
    form.setValue("lotId", lot.id);
  }, [lot, form]);

  const onSubmit = (data: TUpdateLotSchema) => {
    setServerError("");
    updateLot(data);
  };

  return (
    <div className="w-full mx-auto min-h-[80vh]">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Title
          </label>
          <input
            {...form.register("title", { value: lot.title })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Title"
          />
          {form.formState.errors.title && (
            <p className="text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Description
          </label>
          <textarea
            {...form.register("description", { value: lot.description })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Describe your product"
          />
          {form.formState.errors.description && (
            <p className="text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Category
          </label>

          <select
            {...form.register("category", {
              value:
                CATEGORIES.find((el) => el === lot.category) || CATEGORIES[0],
            })}
            aria-label="Choose a category"
            style={{ maxWidth: "500px" }}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {form.formState.errors.category && (
            <p className="text-red-500">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="minBid"
          >
            Minimal Bid
          </label>
          <input
            {...form.register("minBid", {
              valueAsNumber: true,
              value: lot.minBid,
            })}
            className="remove-arrow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="minBid"
            type="number"
            step=".01"
            onBlur={() =>
              form.setValue(
                "minBid",
                Number(Number(form.getValues().minBid).toFixed(2))
              )
            }
          />
          {form.formState.errors.minBid && (
            <p className="text-red-500">
              {form.formState.errors.minBid.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          {serverError && <p className="text-red-500">{serverError}</p>}
        </div>

        <div className="flex items-center">
          <Button size="lg" type="submit">
            <div className="w-14 text-[18px]">
              {isLotUpdating ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                "Update"
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}
