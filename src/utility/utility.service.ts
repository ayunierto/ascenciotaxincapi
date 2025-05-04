import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { AccountsTypesService } from 'src/accounting/accounts-types/accounts-types.service';
import { AccountService } from 'src/accounting/accounts/accounts.service';
import { CurrencyService } from 'src/accounting/currencies/currencies.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UtilityService {
  private SALT_ROUNDS: number;
  private rateLimitAttempts: Map<string, { count: number; timestamp: number }> =
    new Map();

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly accountTypeService: AccountsTypesService,
    private readonly accountService: AccountService,
  ) {
    this.SALT_ROUNDS = 10;
  }

  getRateLimitAttempts(email: string): number {
    const now = Date.now();
    const attempt = this.rateLimitAttempts.get(email);
    if (!attempt || now - attempt.timestamp > 3600000) {
      // 1 hour
      return 0;
    }
    return attempt.count;
  }

  incrementRateLimitAttempts(email: string): void {
    const now = Date.now();
    const attempt = this.rateLimitAttempts.get(email);
    if (!attempt || now - attempt.timestamp > 3600000) {
      this.rateLimitAttempts.set(email, { count: 1, timestamp: now });
    } else {
      attempt.count++;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateNumericCode(length: number): string {
    let code = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  async createDesfaultAccountAndAccountType(user: User): Promise<boolean> {
    try {
      const currency = await this.currencyService.findAll();
      if (currency.length === 0) {
        throw new Error('No currency found');
      }

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
