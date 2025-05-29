import { BadRequestException, Injectable } from '@nestjs/common';

import {
  AnalyzeExpenseCommand,
  TextractClient,
} from '@aws-sdk/client-textract';
import { AnalyzeExpenseDto } from '../accounting/expenses/dto/analyze-expense.dto';
import { DateTime } from 'luxon';

@Injectable()
export class AwsService {
  private textract: TextractClient;

  private region = process.env.AWS_REGION;
  private accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  private secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  constructor() {
    this.textract = new TextractClient({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async analyzeExpense(analyzeExpenseDto: AnalyzeExpenseDto) {
    const { base64Image } = analyzeExpenseDto;
    try {
      const input = {
        Document: {
          Bytes: Buffer.from(base64Image, 'base64'),
        },
      };
      const command = new AnalyzeExpenseCommand(input);

      const response = await this.textract.send(command);

      const detectedValues = {
        merchant: '',
        date: DateTime.utc().toISO(),
        total: '',
        tax: '',
      };

      if (response.ExpenseDocuments)
        response.ExpenseDocuments[0].SummaryFields?.map((field) => {
          if (field.Type && field.Type.Text === 'VENDOR_NAME') {
            detectedValues.merchant = (
              field.ValueDetection?.Text as string
            ).replace(/(\r\n|\r|\n)/g, ' ');
          }
          if (field.Type && field.Type.Text === 'TOTAL') {
            detectedValues.total = this.cleanPrice(
              field.ValueDetection?.Text as string,
            );
          }
          if (field.Type && field.Type.Text === 'INVOICE_RECEIPT_DATE') {
            if (field.ValueDetection && field.ValueDetection.Text) {
              const recoveredDate = DateTime.fromISO(field.ValueDetection.Text);

              if (recoveredDate.isValid) {
                detectedValues.date = recoveredDate.toUTC().toISO();
              }
            }
          }
          if (field.Type && field.Type.Text === 'TAX') {
            detectedValues.tax = this.cleanPrice(
              field.ValueDetection?.Text as string,
            );
          }
        });

      return detectedValues;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error analyzing expense');
    }
  }

  cleanPrice(price: string) {
    const pattern = /\b\d+(\.\d{2})\b/;
    // Remove currency symbols (e.g., S/, $, €) and replace commas with periods
    const cleanedString = price.replace(/[S/$€]/g, '').replace(',', '.');
    const match = cleanedString.match(pattern);
    if (match) {
      return match[0];
    } else {
      return '00.00';
    }
  }
}
