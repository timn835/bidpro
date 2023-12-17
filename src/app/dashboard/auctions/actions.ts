"use server";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const maxFileSize = 10485760; //10MB

export async function getSignedURL(
  type: string,
  size: number,
  checksum: string,
  auctionId: string
) {
  if (!acceptedTypes.includes(type)) {
    return { failure: "Incorrect file type" };
  }
  if (maxFileSize < size) {
    return { failure: "File too large" };
  }
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) return { failure: "Not authenticated" };

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser || !dbUser.role || dbUser.role !== "ADMIN")
    return { failure: "Not permitted" };

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: generateFileName(),
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: user.id,
    },
  });

  const signedUrl = await getSignedUrl(s3, putObjectCommand, {
    expiresIn: 60,
  });

  const auction = await db.auction.findFirst({
    where: { id: auctionId },
  });

  if (!auction) {
    return { failure: "Auction not found" };
  }

  if (auction.imgUrl) {
    // write code to delete previous image from S3
  }

  await db.auction.update({
    where: { id: auctionId },
    data: { imgUrl: signedUrl.split("?").at(0) },
  });

  return { success: { url: signedUrl } };
}
