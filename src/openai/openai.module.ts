import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';
import { CategoriesModule } from 'src/accounting/categories/categories.module';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService],
  exports: [OpenaiService],
  imports: [CategoriesModule],
})
export class OpenaiModule {}
