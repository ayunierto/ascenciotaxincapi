export interface ExpenseFields {
  merchant: string;
  date: string;
  total: string;
  tax: string;
  // TODO: implement return category and subcategory based on the categories system implemented
  // category: string;
  // subcategory: string;
}

export type AnalyzeExpenseResponse = ExpenseFields;
