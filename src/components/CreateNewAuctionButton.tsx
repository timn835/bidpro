"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

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

const CreateAuctionForm = () => {
  return <div>Create Auction Form</div>;
};
