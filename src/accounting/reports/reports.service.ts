/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit-table';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

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

  async generatePdfReport(
    createReportDto: CreateReportDto,
    user: User,
  ): Promise<Buffer> {
    console.log({ createReportDto });
    return new Promise((resolve, reject) => {
      const doc: any = new PDFDocument();
      const table = {
        headers: ['Country', 'Conversion rate', 'Trend'],
        rows: [
          ['Switzerland', '12%', '+1.12%'],
          ['France', '67%', '-0.98%'],
          ['England', '33%', '+4.44%'],
        ],
      };

      this.create(
        {
          startDate: createReportDto.startDate,
          endDate: createReportDto.endDate,
        },
        user,
      );

      doc.text(
        `Report from ${createReportDto.startDate} to ${createReportDto.endDate}`,
      );
      doc.moveDown();

      try {
        (doc as any).table(table, {
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: () => doc.font('Helvetica').fontSize(8),
        });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
