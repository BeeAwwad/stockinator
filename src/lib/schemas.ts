import { z } from "zod"

export const transactionSchema = z.object({
  uid: z.string().min(1, "Product is required"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .min(1, "Quantity must be at least 1"),
  total: z.number(),
  createdBy: z.string(),
  createdAt: z.date(),
})
