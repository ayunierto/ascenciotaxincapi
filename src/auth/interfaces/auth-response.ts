import { ExceptionResponse } from 'src/common/interfaces';
import { BasicUser } from './basic-user.interface';

export interface UserTokenResponse {
  access_token: string;
  user: BasicUser;
}

export interface UserMessageResponse {
  message: string;
  user: BasicUser;
}

export interface OnlyMessageResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export type RegistrationResponse = UserMessageResponse | ExceptionResponse;
export type ResendEmailVerificationResponse =
  | OnlyMessageResponse
  | ExceptionResponse;
export type LoginResponse = UserTokenResponse | ExceptionResponse;
export type ForgotPasswordResponse = OnlyMessageResponse | ExceptionResponse;
export type ResetPasswordResponse = OnlyMessageResponse | ExceptionResponse;
export type CheckStatusResponse = UserTokenResponse | ExceptionResponse;
export type ResendResetPasswordCodeResponse =
  | OnlyMessageResponse
  | ExceptionResponse;
export type ChangePasswordResponse = UserMessageResponse | ExceptionResponse;
export type DeleteAccountResponse = UserMessageResponse | ExceptionResponse;
