import { IsString, Matches } from 'class-validator';

export class AnalyzeExpenseDto {
  @IsString()
  @Matches(/^data:image\/[a-zA-Z]*;base64,/, {
    message: 'The image must be base64 encoded',
  })
  base64Image: string;
}
