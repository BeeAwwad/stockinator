import { z } from "zod";

export const transactionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0),
  name: z.string(),
});

export const transactionSchema = z.object({
  items: z
    .array(transactionItemSchema)
    .min(1, "At least one product is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name required"),
  price: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(50, "Price must be at least 50"),
  cost_price: z.number().min(0, "Cost price must be ≥ 0"),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .min(1, "Stock must be at least 1"),
});

const MIN_PASSWORD_LENGTH = 8;

export const passwordResetSchema = z
  .object({
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} charcters long.`,
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
