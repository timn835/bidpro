import LotPage from "@/components/LotPage";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    lotId: string;
  };
};

const Page = async ({ params }: PageProps) => {
  // retrieve auction id
  const { lotId } = params;

  // make sure you have a user
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const lot = await db.lot.findFirst({
    where: { id: lotId },
    select: {
      Auction: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!lot) return notFound();
  let lotOwnerId;
  if (user && user.id && lot.Auction?.userId === user.id) lotOwnerId = user.id;

  return (
    <div>
      <LotPage lotId={lotId} lotOwnerId={lotOwnerId} />
    </div>
  );
};

export default Page;
