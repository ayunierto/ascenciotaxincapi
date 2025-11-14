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

export type SignUpResponse = UserMessageResponse;
export type VerifyEmailCodeResponse = UserMessageResponse;
export type ResendEmailVerificationResponse = OnlyMessageResponse;
export type SignInResponse = UserTokenResponse;
export type ForgotPasswordResponse = OnlyMessageResponse;
export type ResetPasswordResponse = OnlyMessageResponse;
export type CheckStatusResponse = UserTokenResponse;
export type ResendResetPasswordCodeResponse = OnlyMessageResponse;
export type ChangePasswordResponse = UserMessageResponse;
export type DeleteAccountResponse = UserMessageResponse;
export type UpdateProfileResponse = UserMessageResponse;
