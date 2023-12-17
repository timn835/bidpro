import AuctionRenderer from "@/components/AuctionRenderer";
import LotsWrapper from "@/components/LotsWrapper";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
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

  // retrieve data from db
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
            <AuctionRenderer auctionId={auctionId} />
            <Image
              src={auction.imgUrl}
              alt="auction image"
              width={100}
              height={100}
            />
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
