import { type ClassValue, clsx } from "clsx";
import { formatDuration } from "date-fns";
import { twMerge } from "tailwind-merge";

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

  if (durationDays > 31) return "more than a month";
  return `${durationDays} days, ${remainingHours} hours and ${remainingMinutes} minutes`;
};
