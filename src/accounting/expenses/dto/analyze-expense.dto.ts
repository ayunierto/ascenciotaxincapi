import { IsString } from 'class-validator';

export class AnalyzeExpenseDto {
  @IsString()
  base64Image: string;
}
