import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    lotId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  // retrieve auction id
  const { lotId } = params;

  // make sure you have a user
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id)
    redirect(`auth-callback?origin=dashboard/lots/${lotId}`);

  const lot = await db.lot.findFirst({
    where: { id: lotId },
    select: {
      title: true,
      description: true,
      category: true,
      mainImgUrl: true,
      minBid: true,
      topBidId: true,
      Auction: {
        select: {
          title: true,
          userId: true,
        },
      },
    },
  });

  if (!lot) return notFound();
  if (lot.Auction?.userId !== user.id) return notFound();

  return <div>Welcome to the {lot.title} page!!!</div>;
};

export default Page;
