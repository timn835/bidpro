"use client";

import { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type DeleteLotButtonProps = {
  lotId: string;
  auctionId: string;
};

const DeleteLotButton = ({ lotId, auctionId }: DeleteLotButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v);
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button size="lg" variant="destructive" className="hover:bg-red-100">
          Delete Lot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DeleteLotConfirm
          lotId={lotId}
          auctionId={auctionId}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DeleteLotButton;

type DeleteLotConfirmProps = {
  lotId: string;
  auctionId: string;
  setIsOpen: (e: boolean) => void;
};

function DeleteLotConfirm({
  lotId,
  auctionId,
  setIsOpen,
}: DeleteLotConfirmProps) {
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  // const utils = trpc.useUtils();
  const { mutate: deleteLot, isLoading: isLotDeleting } =
    trpc.deleteLot.useMutation({
      onSuccess: () => {
        // utils.getUserAuctions.invalidate();
        setIsOpen(false);
        router.push(`/dashboard/auctions/${auctionId}`);
      },
      onError: (err) => {
        console.error(err);
        setServerError("Something went wrong, please try again.");
      },
    });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    deleteLot({ id: lotId });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto min-h-[30vh] flex items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center gap-7 mb-4">
          <h1 className="text-gray-600">
            Are you sure you want to delete this lot?
          </h1>
          <Button variant="destructive" size="lg" className="hover:bg-red-100">
            <div className="w-16 text-[18px]">
              {isLotDeleting ? (
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
