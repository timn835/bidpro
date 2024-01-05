"use server";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const s3 = new S3Client({
  region: process.env.MY_AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
  },
});

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const MAX_FILE_SIZE = 10485760; //10MB

export async function getSignedURLForAuction(
  type: string,
  size: number,
  checksum: string,
  auctionId: string
) {
  if (!ACCEPTED_TYPES.includes(type)) {
    return { failure: "Incorrect file type" };
  }
  if (MAX_FILE_SIZE < size) {
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

  const auction = await db.auction.findFirst({
    where: { id: auctionId },
  });

  if (!auction) {
    return { failure: "Auction not found" };
  }

  if (auction.userId !== user.id) {
    return { failure: "Not permitted" };
  }

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.MY_AWS_BUCKET_NAME,
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

  if (auction.imgUrl) {
    // write code to delete previous image from S3
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.MY_AWS_BUCKET_NAME,
      Key: auction.imgUrl.split("/").pop(),
    });
    await s3.send(deleteObjectCommand);
  }

  await db.auction.update({
    where: { id: auctionId },
    data: { imgUrl: signedUrl.split("?").at(0), imgUploadStatus: "SUCCESS" },
  });

  revalidatePath(`/dashboard/auctions/${auctionId}`);

  return { success: { url: signedUrl } };
}

export async function getSignedURLForLot(
  idx: number,
  type: string,
  size: number,
  checksum: string,
  auctionId: string,
  lotId: string
) {
  if (!ACCEPTED_TYPES.includes(type)) {
    return { failure: "Incorrect file type" };
  }
  if (MAX_FILE_SIZE < size) {
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

  const auction = await db.auction.findFirst({
    where: { id: auctionId },
  });

  if (!auction) {
    return { failure: "Auction not found" };
  }

  if (auction.userId !== user.id) {
    return { failure: "Not permitted" };
  }

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.MY_AWS_BUCKET_NAME,
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

  const imgUrl = signedUrl.split("?")[0];

  await db.lotImage.create({
    data: { imgUrl, lotId },
  });

  // update main image if it is the first one
  if (idx === 0) {
    await db.lot.update({
      where: { id: lotId },
      data: { mainImgUrl: imgUrl },
    });
  }

  return { success: { url: signedUrl } };
}
