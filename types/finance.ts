export const CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Education",
  "Shopping",
  "Health",
  "Bills and Utilities",
  "Entertainment",
  "Housing",
  "Travel",
  "Personal Care",
  "Other",
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Debit Card",
  "Credit Card",
  "Bank Transfer",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Transaction = {
  id: string;
  user_id: string;
  description: string;
  amount: string;
  category: Category;
  transaction_date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  month: string;
  category: Category | null;
  amount: string;
  created_at: string;
  updated_at: string;
};
