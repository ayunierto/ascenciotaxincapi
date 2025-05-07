import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { Auth, GetUser } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  @Auth()
  @Header('Content-Type', 'application/pdf')
  async generatePdf(
    @Res() response: Response,
    @Query() createReportDto: CreateReportDto,
    @GetUser() user: User,
  ) {
    const pdfReport = await this.reportsService.generatePdfReport(
      createReportDto,
      user,
    );

    pdfReport.info.Title = 'Report';
    pdfReport.pipe(response);
    pdfReport.end();
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.reportsService.findAll(paginationDto, user);
  }
}
