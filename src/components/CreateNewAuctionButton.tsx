"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type TCreateAuctionSchema, createAuctionSchema } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

const CreateNewAuctionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>Create Auction</Button>
      </DialogTrigger>
      <DialogContent>
        <CreateAuctionForm />
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewAuctionButton;

function CreateAuctionForm() {
  const [date, setDate] = useState<Date>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TCreateAuctionSchema>({
    resolver: zodResolver(createAuctionSchema),
  });

  const onSubmit = async (data: TCreateAuctionSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("submitted");
    reset();
  };

  return (
    <div className="w-full mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
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
            {...register("title")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Title"
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Location
          </label>
          <input
            {...register("location")}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="location"
            type="text"
            placeholder="Location"
          />
          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
        </div>
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center">
          <Button size="lg">
            <div className="w-12 text-[18px]">
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                "Create"
              )}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}
