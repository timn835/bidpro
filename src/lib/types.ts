import { z } from "zod";

export const createAuctionSchema = z
  .object({
    title: z
      .string()
      .min(1, "A title is required.")
      .max(50, "A title cannot have more than 50 characters."),
    location: z
      .string()
      .min(1, "A location is required.")
      .max(100, "A location cannot have more that 100 characters."),
    startDate: z.coerce.date({
      required_error: "A start date is required.",
    }),
    endDate: z.coerce.date({
      required_error: "An end date is required.",
    }),
  })
  .refine((data) => data.startDate >= new Date(), {
    message: "The start date must be in the future.",
    path: ["startDate"],
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "The start date must be before or equal to the end date.",
    path: ["endDate"],
  });

export type TCreateAuctionSchema = z.infer<typeof createAuctionSchema>;

export const updateAuctionSchema = z
  .object({
    auctionId: z.string().min(1, "An auction id is required."),
    title: z
      .string()
      .min(1, "A title is required.")
      .max(50, "A title cannot have more than 50 characters."),
    location: z
      .string()
      .min(1, "A location is required.")
      .max(100, "A location cannot have more that 100 characters."),
    startDate: z.coerce.date({
      required_error: "A start date is required.",
    }),
    endDate: z.coerce.date({
      required_error: "An end date is required.",
    }),
  })
  // the check for the start date being in the future will be done in the mutation
  .refine((data) => data.startDate <= data.endDate, {
    message: "The start date must be before or equal to the end date.",
    path: ["endDate"],
  });

export type TUpdateAuctionSchema = z.infer<typeof updateAuctionSchema>;

export const CATEGORIES = [
  "Art and Collectibles",
  "Antiques and Vintage Items",
  "Jewelry and Watches",
  "Electronics and Gadgets",
  "Automobiles and Vehicles",
  "Home and Garden",
  "Fashion and Accessories",
  "Sports and Fitness Equipment",
  "Toys and Games",
  "Fine Wines and Spirits",
] as const;

export const createLotSchema = z.object({
  auctionId: z.string().min(1, "An auction id is required."),
  title: z
    .string()
    .min(1, "A title is required.")
    .max(50, "A title cannot have more than 50 characters."),
  description: z
    .string()
    .min(1, "A description is required.")
    .max(200, "A description cannot have more that 200 characters."),
  category: z.enum([...CATEGORIES]),
  minBid: z.number().min(1, "Your bid is too small."),
});

export type TCreateLotSchema = z.infer<typeof createLotSchema>;
