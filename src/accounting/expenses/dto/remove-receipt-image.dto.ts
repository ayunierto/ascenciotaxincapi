import { IsUrl } from 'class-validator';

export class RemoveReceiptImageDto {
  @IsUrl()
  imageUrl: string;
}
