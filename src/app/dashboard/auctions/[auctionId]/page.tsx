import LotsWrapper from "@/components/LotsWrapper";
import UploadImageButton from "@/components/UploadImageButton";
import UpdateAuctionButton from "@/components/UpdateAuctionButton";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { format } from "date-fns";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import DeleteAuctionButton from "@/components/DeleteAuctionButton";
import CreateLotButton from "@/components/CreateLotButton";

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
      <div className="mx-auto w-full grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <div className="flex flex-col md:flex-row justify-around bg-white rounded-md flex-wrap">
              <div className="flex flex-col items-center mb-4">
                <h1 className="font-bold text-xl p-5">{auction.title}</h1>
                <div className="relative h-80 w-80 md:h-96 md:w-96">
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
              <div className="p-1 flex flex-col items-center md:items-start md:ml-4 justify-around">
                <div>
                  <p className="mb-4 truncate">
                    <span className="font-bold">Location: </span>
                    {auction.location}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Starts on: </span>
                    {format(auction.startsAt, "Pp")}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Ends on: </span>
                    {format(auction.endsAt, "Pp")}
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
                <div className="border-b border-t border-zinc-200">
                  <div className="h-14 w-full flex items-center px-2 gap-x-4">
                    <UpdateAuctionButton auction={auction} />
                    <UploadImageButton auctionId={auctionId} />
                  </div>
                  <div className="h-14 w-full flex items-center justify-center px-2 gap-x-4">
                    <DeleteAuctionButton auctionId={auctionId} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end of left side */}

        {/* right side */}
        <div className="px-4 py-6 sm:px-6 lg:pr-8 xl:pr-6">
          <div className="flex flex-col bg-white rounded-md">
            <div>
              <div className="w-full flex flex-wrap justify-between p-4 gap-x-4">
                <h1 className="font-bold text-xl">Lots registered</h1>
                <CreateLotButton auctionId={auctionId} />
              </div>
              <div>List of lots</div>
            </div>
          </div>
        </div>

        {/* end of right side */}
      </div>
    </div>
  );
};

export default Page;
