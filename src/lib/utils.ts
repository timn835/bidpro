import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Image } from "./types";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";

// difference between lots ending in seconds
const LOT_TIME_DELTA = 30;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const calcRemainingTime = (
  endDate: string | undefined,
  lotNum: number
): string => {
  if (!endDate) return "n/a";

  const durationInMinutes = Math.ceil(
    (new Date(endDate).getTime() / 1000 -
      new Date().getTime() / 1000 +
      lotNum * LOT_TIME_DELTA) /
      60
  );
  const durationHours = Math.floor(durationInMinutes / 60);
  const durationDays = Math.floor(durationHours / 24);
  const remainingHours = durationHours - durationDays * 24;
  const remainingMinutes = durationInMinutes - durationHours * 60;

  if (durationDays > 365) return "more than a year";
  return `${durationDays} days, ${remainingHours} hours and ${remainingMinutes} minutes`;
};

export const deleteImagesFromS3 = async (images: Image[]) => {
  const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const deleteImagePromises = images.map(async (image) => {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: image.imgUrl.split("/").pop(),
    });
    await s3.send(deleteObjectCommand);
  });

  try {
    await Promise.all(deleteImagePromises);
  } catch (error) {
    console.log("unable to delete image from s3");
    console.error();
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  // delete images from the database
  const deleteImageDBPromises = images.map(async (image) => {
    await db.lotImage.delete({
      where: {
        id: image.id,
      },
    });
  });
  try {
    await Promise.all(deleteImageDBPromises);
  } catch (error) {
    console.log("unable to delete image from db");
    console.error();
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
};

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}
