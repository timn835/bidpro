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

  const visitorId = user ? user.id : "";

  return (
    <div>
      <LotPage lotId={lotId} visitorId={visitorId} />
    </div>
  );
};

export default Page;
