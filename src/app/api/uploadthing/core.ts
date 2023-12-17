import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      // Check if user exists and is an admin
      if (!user || !user.id) throw new Error("Unauthorized");
      const dbUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
      });
      if (!dbUser || dbUser.role !== "ADMIN") throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.auction.create({
        data: {
          imgKey: file.key,
          title: "Auction created on image upload",
          location: "Fake location from auction created on image upload",
          startsAt: new Date(),
          endsAt: new Date(),
          userId: metadata.userId,
          imgUrl: `https://uploadthing.prod.s3.us-west-2.amazonaws.com/${file.key}`,
          imgUploadStatus: "PROCESSING",
        },
      });
      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
