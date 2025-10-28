export interface ExpenseFields {
  merchant: string;
  date: string;
  total: number;
  tax: number;
  categoryId: string;
  subcategoryId: string;
}

export type AnalyzeExpenseResponse = ExpenseFields;
