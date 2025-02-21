import { Injectable } from '@nestjs/common';

import {
  AnalyzeExpenseCommand,
  TextractClient,
} from '@aws-sdk/client-textract';
import { AnalyzeExpenseDto } from './dto/analyze-expense.dto';

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
      // AnalyzeExpenseRequest
      const input = {
        Document: {
          Bytes: base64Image ? Buffer.from(base64Image, 'base64') : undefined, // convert image to byte
        },
      };
      const command = new AnalyzeExpenseCommand(input);

      const response = await this.textract.send(command);

      return response;
    } catch (error) {
      console.error('Error', error);
    }
  }
}
