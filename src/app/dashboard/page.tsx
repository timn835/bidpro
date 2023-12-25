import AdminDashboard from "@/components/dashboards/AdminDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
const page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) redirect("/auth-callback?origin=dashboard");

  if (dbUser.role === "ADMIN") return <AdminDashboard />;
  return <UserDashboard />;
};

export default page;
