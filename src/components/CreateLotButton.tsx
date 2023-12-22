"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type TCreateLotSchema,
  createLotSchema,
  CATEGORIES,
} from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { trpc } from "@/app/_trpc/client";
import { TimePicker } from "./TimePicker";

type CreateLotButtonProps = {
  auctionId: string;
};

const CreateLotButton = ({ auctionId }: CreateLotButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button
          size="lg"
          variant="secondary"
          className="bg-emerald-200 hover:bg-emerald-300"
        >
          Add a Lot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CreateLotForm auctionId={auctionId} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateLotButton;

type CreateLotFormProps = {
  auctionId: string;
  setIsOpen: (value: boolean) => void;
};

function CreateLotForm({ auctionId, setIsOpen }: CreateLotFormProps) {
  const [serverError, setServerError] = useState("");
  const utils = trpc.useUtils();
  const { mutate: createLot, isLoading: isLotCreating } =
    trpc.createLot.useMutation({
      onSuccess: () => {
        utils.getAuctionLots.invalidate();
        form.reset();
        setIsOpen(false);
      },
      onError: (err) => {
        console.error(err);
        setServerError("Something went wrong, please try again.");
      },
    });
  const form = useForm<TCreateLotSchema>({
    resolver: zodResolver(createLotSchema),
  });

  useEffect(() => {
    form.setValue("auctionId", auctionId);
  }, [auctionId, form]);

  const onSubmit = async (data: TCreateLotSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(JSON.stringify(data));
    // setServerError("");
    // createLot(data);
  };

  return (
    <div className="w-full mx-auto min-h-[60vh] flex flex-col items-top">
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
            <input
              {...form.register("title")}
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
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              {...form.register("description")}
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
              {...form.register("category")}
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
            {serverError && <p className="text-red-500">{serverError}</p>}
          </div>
          <div className="flex items-center">
            <Button size="lg" type="submit">
              <div className="w-12 text-[18px]">
                {isLotCreating ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  "Create"
                )}
              </div>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
