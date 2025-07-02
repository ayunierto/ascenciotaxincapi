import { ExceptionResponse } from 'src/common/interfaces';
import { Currency } from '../entities/currency.entity';

export type CreateCurrencyResponse = Currency | ExceptionResponse;
export type GetCurrencyResponse = Currency | ExceptionResponse;
export type GetCurrenciesResponse = Currency[] | ExceptionResponse;
export type UpdateCurrencyResponse = Currency | ExceptionResponse;
export type DeleteCurrencyResponse = Currency | ExceptionResponse;
