"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type TUpdateLotSchema, updateLotSchema } from "@/lib/types";
import { Loader2 } from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { CATEGORIES } from "@/config/constants";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
        <Button aria-label="open dialog box to update the lot">
          Update Lot
        </Button>
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
  const [serverError, setServerError] = useState<string>("");
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
    form.setValue("category", CATEGORIES.find((el) => el === lot.category)!);
  }, [lot, form]);

  const onSubmit = (data: TUpdateLotSchema) => {
    setServerError("");
    updateLot(data);
  };

  return (
    <div className="w-full mx-auto min-h-[80vh]">
      <Form {...form}>
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
            <Input
              {...form.register("title", { value: lot.title })}
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
              htmlFor="description"
            >
              Description
            </label>
            <Textarea
              {...form.register("description", { value: lot.description })}
              rows={1}
              id="description"
              placeholder="Describe your product"
              maxRows={4}
              className="resize-none"
            />
            {form.formState.errors.description && (
              <p className="text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={CATEGORIES.find((el) => el === lot.category)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
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
            <Input
              {...form.register("minBid", {
                valueAsNumber: true,
                value: lot.minBid,
              })}
              className="remove-arrow"
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
            <Button
              size="lg"
              type="submit"
              aria-label="proceed to updating the lot"
            >
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
      </Form>
    </div>
  );
}
