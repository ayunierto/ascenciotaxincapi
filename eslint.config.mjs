// eslint.config.js
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import nestjsPlugin from '@darraghor/eslint-plugin-nestjs-typed'; // Optional: for NestJS-specific rules

export default defineConfig([
  // ESLint's recommended rules
  tseslint.configs.recommended,
  // TypeScript-specific recommended rules (type-aware)
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json', // Path to your tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier,
      '@darraghor/nestjs-typed': nestjsPlugin, // Optional: for NestJS-specific rules
    },
    rules: {
      'prettier/prettier': 'error',
      // Other custom rules or overrides
      '@darraghor/nestjs-typed/injectable-should-be-provided': 'error', // Example NestJS rule
    },
  },
]);
