import LotsFeed from "@/components/LotsFeed";
import { db } from "@/db";
import { getBase64 } from "@/trpc";
import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

const fetchAuctionInfo = async (auctionId: string) => {
  const auction = await db.auction.findFirst({
    where: {
      id: auctionId,
    },
  });

  // fetch blur image
  const blurImgUrl = auction?.imgUrl
    ? await getBase64(auction.imgUrl)
    : "/standard-auction-small.jpg";
  return { auction, blurImgUrl };
};

const Page = async (props: PageProps) => {
  const auctionId = props.params.auctionId;
  if (typeof auctionId !== "string") return notFound();

  const { auction, blurImgUrl } = await fetchAuctionInfo(auctionId);
  if (!auction) return notFound();
  return (
    <main>
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

      <LotsFeed {...props} />
    </main>
  );
};

export default Page;
