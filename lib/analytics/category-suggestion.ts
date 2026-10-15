import type { Category } from "@/types/finance";

const rules: Array<{ category: Category; terms: string[] }> = [
  { category: "Food", terms: ["restaurant", "cafe", "coffee", "pizza", "food", "dining"] },
  { category: "Groceries", terms: ["supermarket", "grocery", "groceries", "market", "vegetables"] },
  { category: "Transport", terms: ["bus", "metro", "taxi", "train", "fuel", "uber", "ola"] },
  { category: "Education", terms: ["tuition", "books", "course", "school", "college"] },
  { category: "Bills and Utilities", terms: ["electricity", "internet", "water bill", "utility", "phone bill"] },
];

export function suggestCategory(description: string): Category | null {
  const normalized = description.toLocaleLowerCase("en");
  return rules.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.category ?? null;
}
