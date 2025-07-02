import { ExceptionResponse } from 'src/common/interfaces';
import { AccountType } from '../entities/account-type.entity';

export type CreateAccountTypeResponse = AccountType | ExceptionResponse;
export type GetAccountTypeResponse = AccountType | ExceptionResponse;
export type GetAccountTypesResponse = AccountType[] | ExceptionResponse;
export type UpdateAccountTypeResponse = AccountType | ExceptionResponse;
export type DeleteAccountTypeResponse = AccountType | ExceptionResponse;
