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
  })
  .refine((data) => data.title !== data.location, {
    message: "Title cannot match location",
    path: ["location"],
  });

export type TCreateAuctionSchema = z.infer<typeof createAuctionSchema>;
