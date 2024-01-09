import { z } from "zod";
import { CATEGORIES, MAX_NEXT_BID_DELTA } from "../config/constants";

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

export const createLotSchema = z.object({
  auctionId: z.string().min(1, "An auction id is required."),
  title: z
    .string()
    .min(1, "A title is required.")
    .max(50, "A title cannot have more than 50 characters."),
  description: z
    .string()
    .min(1, "A description is required.")
    .max(300, "A description cannot have more that 300 characters."),
  category: z.enum([...CATEGORIES], {
    required_error: "A category is required.",
  }),
  minBid: z
    .number({ invalid_type_error: "Your bid must be a number." })
    .min(1, "Your bid is too small.")
    .max(MAX_NEXT_BID_DELTA, "Your minimal bid is too high."),
});

export type TCreateLotSchema = z.infer<typeof createLotSchema>;

export const updateLotSchema = z.object({
  lotId: z.string().min(1, "A lot id is required."),
  auctionId: z.string().min(1, "An auction id is required."),
  title: z
    .string()
    .min(1, "A title is required.")
    .max(50, "A title cannot have more than 50 characters."),
  description: z
    .string()
    .min(1, "A description is required.")
    .max(300, "A description cannot have more that 300 characters."),
  category: z.enum([...CATEGORIES]),
  minBid: z
    .number({ invalid_type_error: "Your bid must be a number" })
    .min(1, "Your bid is too small.")
    .max(MAX_NEXT_BID_DELTA, "Your minimal bid is too high."),
});

export type TUpdateLotSchema = z.infer<typeof updateLotSchema>;

export const imageSchema = z.array(
  z.object({
    id: z.string().min(1, "An image id is required."),
    imgUrl: z.string().min(1, "An image url is required."),
  })
);

export type TImageSchema = z.infer<typeof imageSchema>;

export type Image = {
  id: string;
  imgUrl: string;
};
