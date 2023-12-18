"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useForm, SubmitHandler } from "react-hook-form";

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

type FormValues = {
  title: string;
  location: string;
};

function CreateAuctionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("submitted");
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <input
        {...register("title", {
          required: "An auction title is required.",
          maxLength: {
            value: 50,
            message: "A title cannot have more than 50 characters",
          },
        })}
        placeholder="Title"
        className="outline-none"
      />
      {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      <input
        {...register("location", {
          required: "An auction location is required.",
          maxLength: {
            value: 100,
            message: "A location cannot have more than 100 characters",
          },
        })}
        placeholder="Location"
        className="outline-none"
      />
      {errors.location && (
        <p className="text-red-500">{errors.location.message}</p>
      )}

      <button disabled={isSubmitting} type="submit">
        Create Auction
      </button>
    </form>
  );
}
