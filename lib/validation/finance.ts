import { z } from "zod";
import { CATEGORIES, PAYMENT_METHODS } from "@/types/finance";

const amountSchema = z
  .string()
  .trim()
  .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, "Enter a positive amount with up to two decimal places.")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero.");

const transactionDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid transaction date.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return value.slice(0, 4) !== "0000" && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Choose a valid transaction date.")
  .refine((value) => value <= new Date().toISOString().slice(0, 10), "Transaction date cannot be in the future.");

export const transactionSchema = z.object({
  description: z.string().trim().min(1, "Description is required.").max(100, "Description must be 100 characters or fewer."),
  amount: amountSchema,
  category: z.enum(CATEGORIES),
  transaction_date: transactionDateSchema,
  payment_method: z.enum(PAYMENT_METHODS),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer.").optional().default(""),
});

export const budgetSchema = z.object({
  month: z.string().regex(/^(?!0000)\d{4}-(0[1-9]|1[0-2])$/, "Choose a valid budget month."),
  category: z.union([z.enum(CATEGORIES), z.literal("")]).default(""),
  amount: amountSchema,
});

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
