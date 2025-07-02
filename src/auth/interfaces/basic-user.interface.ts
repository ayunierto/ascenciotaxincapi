export interface BasicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  locale?: string;
  roles: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
