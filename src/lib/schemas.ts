import { z } from "zod";

export const transactionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(1, "Amount must be at least 1"),
  total: z.number(),
  createdBy: z.string(),
  createdAt: z.date(),
});
