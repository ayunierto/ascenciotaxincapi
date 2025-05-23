export interface ExpensesByCategory {
  [category: string]: {
    [subcategory: string]: ExpenseValues;
    total: ExpenseValues;
  };
}

export interface ExpenseValues {
  gross: number;
  hst: number;
  net: number;
}
