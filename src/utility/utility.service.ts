import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { AccountsTypesService } from 'src/accounting/accounts-types/accounts-types.service';
import { AccountService } from 'src/accounting/accounts/accounts.service';
import { CurrencyService } from 'src/accounting/currencies/currencies.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UtilityService {
  private SALT_ROUNDS: number;

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly accountTypeService: AccountsTypesService,
    private readonly accountService: AccountService,
  ) {
    this.SALT_ROUNDS = 10;
  }

  /**
   * Hashes a plain text password.
   * @param password The plain text password.
   * @returns The hashed password string.
   */
  async hashPassword(password: string): Promise<string> {
    // Use a robust hashing library like bcrypt
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  /**
   * Compares a plain text password with a hashed password.
   * @param plainPassword The plain text password from the user.
   * @param hashedPassword The hashed password from the database.
   * @returns True if the passwords match, false otherwise.
   */
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // Use the comparison method from your hashing library
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generates a random numeric code of a given length.
   * @param length The desired length of the code.
   * @returns The generated numeric code as a string.
   */
  generateNumericCode(length: number): string {
    let code = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * Initializes user settings for the given user.
   * @param user The user object to initialize settings for.
   * @returns A promise that resolves to true if initialization is successful.
   */
  async createDesfaultAccountAndType(user: User): Promise<boolean> {
    try {
      // Initialize default currency
      const currency = await this.currencyService.findAll();
      if (currency.length === 0) {
        throw new Error('No currency found');
      }

      // Initialize default account type
      const accountTypeCashDefault = await this.accountTypeService.create(
        {
          name: 'Cash',
          description: 'Cash account',
        },
        user,
      );
      if (!accountTypeCashDefault) {
        throw new Error('Failed to create account type');
      }

      // Initialize default accounts
      await this.accountService.create(
        {
          accountTypeId: accountTypeCashDefault.id,
          currencyId: currency[0].id,
          name: 'Cash',
          description: 'Cash account',
          icon: 'cash',
        },
        user,
      );
      if (!accountTypeCashDefault) {
        throw new Error('Failed to create account');
      }

      return true;
    } catch (error) {
      console.error('Error initializing user settings:', error);
      return false;
    }
  }
}
