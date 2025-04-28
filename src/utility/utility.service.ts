import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UtilityService {
  private SALT_ROUNDS: number;

  constructor() {
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
}
