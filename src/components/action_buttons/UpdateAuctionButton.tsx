"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type TUpdateAuctionSchema, updateAuctionSchema } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { TimePicker } from "../TimePicker";
import { Input } from "../ui/input";

type Auction = {
  id: string;
  title: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
};

type UpdateAuctionButtonProps = {
  auction: Auction;
};

const UpdateAuctionButton = ({ auction }: UpdateAuctionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button aria-label="open dialog box to update the auction">
          Update Auction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <UpdateAuctionForm auction={auction} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAuctionButton;

type UpdateAuctionFormProps = {
  auction: Auction;
  setIsOpen: (value: boolean) => void;
};

function UpdateAuctionForm({ auction, setIsOpen }: UpdateAuctionFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const utils = trpc.useUtils();
  const { mutate: updateAuction, isLoading: isAuctionUpdating } =
    trpc.updateAuction.useMutation({
      onSuccess: () => {
        utils.getUserAuctions.invalidate();
        form.reset();
        setIsOpen(false);
        router.push(`/dashboard/auctions`);
      },
      onError: (err) => {
        setServerError("Something went wrong, please try again.");
      },
    });
  const form = useForm<TUpdateAuctionSchema>({
    resolver: zodResolver(updateAuctionSchema),
  });

  useEffect(() => {
    form.setValue("auctionId", auction.id);
    form.setValue("startDate", auction.startsAt);
    form.setValue("endDate", auction.endsAt);
  }, [auction.id, auction.startsAt, auction.endsAt, form]);

  const onSubmit = async (data: TUpdateAuctionSchema) => {
    setServerError("");
    updateAuction(data);
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // alert(JSON.stringify(data));
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
              {...form.register("title", { value: auction.title })}
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
              Location
            </label>
            <Input
              {...form.register("location", { value: auction.location })}
              id="location"
              type="text"
              placeholder="Location"
            />
            {form.formState.errors.location && (
              <p className="text-red-500">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Auction Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          aria-label="open calendar to select a new start date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().toDateString())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.startDate && (
              <p className="text-red-500">
                {form.formState.errors.startDate.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Auction End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          aria-label="open calendar to select a new end date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().toDateString()) ||
                          (form.getValues("startDate") &&
                            form.getValues("startDate") > date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="p-3 border-t border-border">
                    <TimePicker setDate={field.onChange} date={field.value} />
                  </div>
                </FormItem>
              )}
            />
            {form.formState.errors.endDate && (
              <p className="text-red-500">
                {form.formState.errors.endDate.message}
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
              aria-label="proceed to updating the auction"
            >
              <div className="w-14 text-[18px]">
                {isAuctionUpdating ? (
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
