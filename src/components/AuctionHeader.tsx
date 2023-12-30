import { format } from "date-fns";
import Image from "next/image";

type AuctionHeaderProps = {
  auction: {
    id: string;
    title: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    imgUrl: string | null;
  };
  blurImgUrl: string;
};
const AuctionHeader = ({ auction, blurImgUrl }: AuctionHeaderProps) => {
  return (
    <div className="text-zinc-600 rounded-xl bg-white shadow-lg mx-6 mt-6 text-center flex flex-col sm:flex-row items-center justify-around">
      <div className="relative h-96 w-96 my-6">
        <Image
          src={auction.imgUrl ? auction.imgUrl : "/standard-auction.jpg"}
          alt="auction-image"
          fill
          style={{ objectFit: "cover" }}
          sizes={"300px"}
          className="rounded-md"
          placeholder="blur"
          blurDataURL={blurImgUrl}
        />
      </div>
      <div className="flex flex-col justify-center items-center gap-y-5 p-4">
        <h1 className="text-5xl font-semibold">{auction.title}</h1>
        <p className="text-xl">
          Runs between{" "}
          <span className="font-semibold">
            {format(auction.startsAt, "PPPP")}
          </span>{" "}
          and{" "}
          <span className="font-semibold">
            {format(auction.endsAt, "PPPP")}
          </span>
        </p>
        <p className="text-xl">
          Held at <span className="font-semibold">{auction.location}</span>
        </p>
      </div>
    </div>
  );
};

export default AuctionHeader;
