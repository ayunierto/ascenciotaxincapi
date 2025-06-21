import {
  Controller,
  Get,
  Header,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'application/pdf')
  async generatePdf(
    @Res() response: Response,
    @Query() createReportDto: CreateReportDto,
    @Request() req,
  ) {
    const pdfReport = await this.reportsService.generatePdfReport(
      createReportDto,
      req.user,
    );

    pdfReport.info.Title = 'Report';
    pdfReport.pipe(response);
    pdfReport.end();
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.reportsService.findAll(paginationDto, req.user);
  }
}
