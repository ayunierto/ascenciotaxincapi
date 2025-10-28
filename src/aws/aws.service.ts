import { BadRequestException, Injectable } from '@nestjs/common';

import {
  AnalyzeExpenseCommand,
  AnalyzeExpenseCommandInput,
  TextractClient,
} from '@aws-sdk/client-textract';
import { AnalyzeExpenseDto } from '../accounting/expenses/dto/analyze-expense.dto';
import { DateTime } from 'luxon';
import { AnalyzeExpenseResponse } from './interfaces';

@Injectable()
export class AwsService {
  private textract: TextractClient;

  constructor() {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are not properly configured.');
    }

    this.textract = new TextractClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async analyzeExpenseFromImageUrl(
    url: string,
  ): Promise<AnalyzeExpenseResponse> {
    // 1 Download the image from Cloudinary
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    // 2 Prepare the command for AWS Textract
    const textractCommand = new AnalyzeExpenseCommand({
      Document: { Bytes: new Uint8Array(arrayBuffer) },
    });

    // 3 Send to AWS Textract
    const textractResponse = await this.textract.send(textractCommand);

    // 4 Extract useful data
    const parsed = await this.parseTextractExpense(textractResponse);
    return {
      ...parsed,
    };
  }

  // Process the result of AWS Textract AnalyzeExpenseCommand
  async parseTextractExpense(textractResponse) {
    if (!textractResponse?.ExpenseDocuments?.length) return null;

    const summaryFields = textractResponse.ExpenseDocuments[0].SummaryFields;

    const result = {
      merchant: '',
      date: '',
      total: 0,
      tax: 0,
      imageUrl: '',
      categoryId: '',
      subcategoryId: '',
    };

    for (const field of summaryFields) {
      const fieldType = field.Type?.Text?.toUpperCase();
      const fieldValue = field.ValueDetection?.Text?.trim();

      if (!fieldType || !fieldValue) continue;

      switch (fieldType) {
        case 'VENDOR_NAME':
        case 'RECEIVER_NAME':
        case 'SUPPLIER_NAME':
        case 'MERCHANT_NAME':
          result.merchant = fieldValue;
          break;

        case 'INVOICE_RECEIPT_DATE':
        case 'DUE_DATE':
        case 'ORDER_DATE':
          result.date = fieldValue;
          break;

        case 'TOTAL':
        case 'AMOUNT_DUE':
        case 'BALANCE_DUE':
          result.total = fieldValue;
          break;

        case 'TAX':
        case 'TOTAL_TAX':
          result.tax = fieldValue;
          break;
      }
    }

    return {
      merchant: result.merchant,
      date: this.normalizeDate(result.date),
      total: this.normalizeCurrency(result.total),
      tax: this.normalizeCurrency(result.tax),
      categoryId: result.categoryId,
      subcategoryId: result.subcategoryId,
    };
  }

  normalizeCurrency(value: string | number | null | undefined): number {
    if (value == null) return 0.0;

    //  Convert to string and clear spaces

    let str = String(value).trim();

    // 1️⃣ Remove non-numeric text or symbols except digits, dot or comma
    str = str.replace(/[^0-9.,-]/g, '');

    // 2️⃣ If it has a comma, replace it with a dot
    str = str.replace(',', '.');

    // 3️⃣ Remove multiple dots (keep only the last one)
    const parts = str.split('.');
    if (parts.length > 2) {
      const lastPart = parts.pop();
      str = parts.join('') + '.' + lastPart;
    }

    // 4️⃣ Convert to number
    const num = parseFloat(str);

    // 5️⃣ If it's not valid, return 0.00
    if (isNaN(num)) return 0.0;

    // 6️⃣ Format with two decimals
    return num;
  }

  normalizeDate(value: string | Date | null | undefined): string {
    if (!value) return '';

    let date: Date | null = null;

    // If the value is already a Date object
    if (value instanceof Date) {
      date = value;
    } else {
      // Basic cleanup
      const str = value.trim();

      // Try to detect several common formats
      //1 ISO or similar
      if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
        date = new Date(str.replace(/[-/.]/g, '-'));
      }
      // 2 MM/DD/YYYY or MM/DD/YY
      else if (/^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/.test(str)) {
        const [m, d, y] = str.split(/[/.-]/);
        const year = y.length === 2 ? '20' + y : y;
        date = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      }
      // 3 Format like "Oct 20 2025" or "20 Oct 25"
      else if (/[A-Za-z]/.test(str)) {
        date = new Date(str);
      }
    }

    if (!date || isNaN(date.getTime())) {
      return ''; // invalid value
    }

    // Return in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
