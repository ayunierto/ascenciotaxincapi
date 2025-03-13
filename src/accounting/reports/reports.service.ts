import { BadRequestException, Injectable } from '@nestjs/common';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrinterService } from 'src/printer/printer.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    private readonly printer: PrinterService,
  ) {}

  async generatePdfReport(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createReportDto: CreateReportDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User,
  ): Promise<PDFKit.PDFDocument> {
    const documentDefinition: TDocumentDefinitions = {
      content: ['hello world', 'Resport created'],
    };

    return this.printer.createPdf(documentDefinition);
  }

  async create(createReportDto: CreateReportDto, user: User) {
    try {
      const plan = this.reportRepository.create({ user, ...createReportDto });
      await this.reportRepository.save(plan);
      return plan;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Unable to create plans');
    }
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const logs = await this.reportRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        order: {
          createdAt: 'DESC',
        },
      });
      return logs;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
