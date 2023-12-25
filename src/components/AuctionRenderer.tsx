import UploadButton from "./action_buttons/UploadImageButton";

type AuctionRendererProps = {
  auctionId: string;
};

const AuctionRenderer = ({ auctionId }: AuctionRendererProps) => {
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center justify-between gap-1.5">
          <div>Auction title</div>
        </div>
        <UploadButton auctionId={auctionId} />
      </div>
    </div>
  );
};

export default AuctionRenderer;
