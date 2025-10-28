import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AnalyzeExpenseDto } from './dto/analyze-expense.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { RemoveReceiptImageDto } from './dto/remove-receipt-image.dto';
import { OcrService } from 'src/ocr/ocr.service';
import { OpenaiService } from 'src/openai/openai.service';

@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly filesService: FilesService,
    private readonly ocrService: OcrService,
    private readonly openaiService: OpenaiService,
  ) {}

  @Post()
  @Auth()
  create(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: User) {
    return this.expenseService.create(createExpenseDto, user);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.expenseService.findAll(paginationDto, user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.expenseService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetUser() user: User,
  ) {
    return this.expenseService.update(id, updateExpenseDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.expenseService.remove(id, user);
  }

  @Post('upload-receipt-image')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException(
        'File is required, please upload a file in the "file" field',
      );
    }
    // Create temp folder for user.
    const folderPath = `ascencio_tax_inc/temp_receipts/${user.id}`;
    const uploadResult = await this.filesService.upload(file, folderPath);

    if (!uploadResult || !('secure_url' in uploadResult)) {
      throw new BadRequestException('Failed to upload receipt image');
    }

    return {
      url: uploadResult.secure_url,
    };
  }

  @Post('analyze-image-url')
  @Auth()
  async analyzeExpenseUrl(@Body() { imageUrl }: AnalyzeExpenseDto) {
    const text = await this.ocrService.extractTextFromImage(imageUrl);
    const data = await this.openaiService.analyzeReceiptText(text);
    return data;
  }

  @Post('delete-receipt-image')
  @Auth()
  async deleteReceipt(@Body() { imageUrl }: RemoveReceiptImageDto) {
    return await this.filesService.delete(this.extractPublicId(imageUrl));
  }

  extractPublicId(url: string): string | null {
    try {
      // Example:
      // https://res.cloudinary.com/demo/image/upload/v1720001234/ascencio_tax_inc/temp_receipts/42/receipt_abc123.jpg
      const parts = url.split('/upload/');
      const path = parts[1].split('.')[0]; // ascencio_tax_inc/temp_receipts/42/receipt_abc123
      // Delete prefix of version v1720001234/
      return path.replace(/^v\d+\//, '');
    } catch {
      return null;
    }
  }
}
