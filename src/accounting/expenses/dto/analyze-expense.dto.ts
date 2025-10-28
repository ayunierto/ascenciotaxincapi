import { IsUrl } from 'class-validator';

export class AnalyzeExpenseDto {
  @IsUrl()
  imageUrl: string;
}
