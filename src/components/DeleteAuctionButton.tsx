"use client";

import { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type DeleteAuctionButtonProps = {
  disabled: boolean;
  auctionId: string;
};

const DeleteAuctionButton = ({
  auctionId,
  disabled,
}: DeleteAuctionButtonProps) => {
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
          variant="destructive"
          size="lg"
          className="hover:bg-red-100"
          disabled={disabled}
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DeleteAuctionConfirm auctionId={auctionId} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAuctionButton;

type DeleteAuctionConfirmProps = {
  auctionId: string;
  setIsOpen: (e: boolean) => void;
};

function DeleteAuctionConfirm({
  auctionId,
  setIsOpen,
}: DeleteAuctionConfirmProps) {
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  // const utils = trpc.useUtils();
  const { mutate: deleteAuction, isLoading: isAuctionDeleting } =
    trpc.deleteAuction.useMutation({
      onSuccess: () => {
        // utils.getUserAuctions.invalidate();
        setIsOpen(false);
        router.push("/dashboard");
      },
      onError: (err) => {
        console.error(err);
        setServerError("Something went wrong, please try again.");
      },
    });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // alert("Auction deleted");
    deleteAuction({ id: auctionId });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto min-h-[30vh] flex items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-7 mb-4">
          <h1 className="text-gray-500">
            Are you sure you want to delete this auction?
          </h1>
          <Button variant="destructive" size="lg" className="hover:bg-red-100">
            <div className="w-16 text-[18px]">
              {isAuctionDeleting ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                "Proceed"
              )}
            </div>
          </Button>
        </div>
        {serverError && (
          <div className="mb-4">
            <p className="text-red-500">{serverError}</p>
          </div>
        )}
      </div>
    </form>
  );
}
