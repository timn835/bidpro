import LotsWrapper from "@/components/LotsWrapper";
import UploadImageButton from "@/components/UploadImageButton";
import UpdateAuctionButton from "@/components/UpdateAuctionButton";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { format } from "date-fns";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    auctionId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  // retrieve auction id
  const { auctionId } = params;

  // make sure you have a user
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id)
    redirect(`auth-callback?origin=dashboard/auctions/${auctionId}`);

  const auction = await db.auction.findFirst({
    where: { id: auctionId, userId: user.id },
  });

  if (!auction) return notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col items-center mb-4">
                <h1 className="font-bold text-xl p-5">{auction.title}</h1>
                <div className="relative h-80 w-80">
                  <Image
                    src={
                      auction.imgUrl ? auction.imgUrl : "/standard-auction.jpg"
                    }
                    alt="auction-image"
                    fill
                    style={{ objectFit: "cover" }}
                    sizes={"500px"}
                    // objectPosition="top"
                    // width={100}
                    // height={100}
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start md:ml-4 justify-around">
                <div>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Location: </span>
                    {auction.location}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Starts on: </span>
                    {format(auction.startsAt, "PPpp")}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Ends on: </span>
                    {format(auction.endsAt, "PPpp")}
                  </p>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Total # of lots: </span>
                    {auction.numOfLots}
                  </p>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Total # of bids: </span>
                    To be implemented...
                  </p>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Most popular lot: </span>
                    {auction.mostPopularLotTitle
                      ? auction.mostPopularLotTitle
                      : "N/A"}
                  </p>
                </div>
                <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-center px-2 gap-x-4">
                  <UpdateAuctionButton auction={auction} />
                  <UploadImageButton auctionId={auctionId} />
                </div>
                <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-center px-2 gap-x-4">
                  <UpdateAuctionButton auction={auction} />
                </div>
              </div>
            </div>

            {/* auction renderer */}
            {/* <div className="w-full bg-white rounded-md shadow flex flex-col items-center"></div> */}
            {/* end of auction renderer */}
          </div>
        </div>
        {/* end of left side */}

        {/* right side */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <LotsWrapper />
        </div>
        {/* end of right side */}
      </div>
    </div>
  );
};

export default Page;
