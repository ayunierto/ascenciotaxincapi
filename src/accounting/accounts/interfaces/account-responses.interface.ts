import { ExceptionResponse } from 'src/common/interfaces';
import { Account } from '../entities/account.entity';

export type CreateAccountResponse = Account | ExceptionResponse;
export type UpdateAccountResponse = Account | ExceptionResponse;
export type DeleteAccountResponse = Account | ExceptionResponse;
export type GetAccountResponse = Account | ExceptionResponse;
export type GetAccountsResponse = Account[] | ExceptionResponse;
