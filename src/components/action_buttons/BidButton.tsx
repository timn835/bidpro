import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import BiddingForm from "../BiddingForm";

type BidButtonProps = {
  lotId: string;
  lotTitle: string;
  lotNumber: number;
  minBid: number;
  numOfBids: number;
  imgUrl: string;
};

const BidButton = ({
  lotId,
  lotTitle,
  lotNumber,
  minBid,
  numOfBids,
  imgUrl,
}: BidButtonProps) => {
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
          className="w-32"
          aria-label="open dialog box to bid on the lot"
        >
          Bid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <BiddingForm
          lotId={lotId}
          lotTitle={lotTitle}
          lotNumber={lotNumber}
          minBid={minBid}
          numOfBids={numOfBids}
          imgUrl={imgUrl}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BidButton;
