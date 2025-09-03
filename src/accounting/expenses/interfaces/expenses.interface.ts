import { ExceptionResponse } from 'src/common/interfaces';
import { Expense } from '../entities/expense.entity';

export type CreateExpenseResponse = Expense | ExceptionResponse;
export type UpdateExpenseResponse = Expense | ExceptionResponse;
export type DeleteExpenseResponse = Expense | ExceptionResponse;
export type GetExpenseResponse = Expense | ExceptionResponse;
export type GetExpensesResponse = Expense[] | ExceptionResponse;
