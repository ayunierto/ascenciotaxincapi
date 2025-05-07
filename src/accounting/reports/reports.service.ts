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
    createReportDto: CreateReportDto,
    user: User,
  ): Promise<PDFKit.PDFDocument> {
    // --- INICIO: Definición del Documento PDFMake ---
    const documentDefinition: TDocumentDefinitions = {
      pageOrientation: 'landscape',
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 30], // Ajustado [L, T, R, B] para más espacio de cabecera

      content: [
        {
          text: 'INTERNAL CONTROL WORK SHEET',
          italics: true,
          alignment: 'right',
          fontSize: 10,
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: [60, '*', '*'],
            body: [
              [
                { rowSpan: 2, text: 'AT', fontSize: 42 },
                { text: 'ASCENCIO TAX INC.', bold: true, fontSize: 20 },
                {
                  text: 'NOMBRE / TELEFONO',
                  fontSize: 16,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                '',
                'Personal and Business Income Tax Services',
                {
                  text: 'Alcides Turrruellas Osorio / +51917732227',
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*', 65, 65, 65, 65, 65],
            body: [
              [
                { text: 'DESCRIPTION', style: 'tableHeader' },
                { text: 'JAN-MAR', style: 'tableHeader' },
                { text: 'APR-JUN', style: 'tableHeader' },
                { text: 'JUL-SEP', style: 'tableHeader' },
                { text: 'OCT-DEC', style: 'tableHeader' },
                { text: 'TOTAL', style: 'tableHeader' },
              ],
              [
                { text: 'Revenues - Sales', bold: true, colSpan: 6 },
                { text: '' },
                { text: '' },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
            ],
          },
        },

        // Texto final opcional
        {
          text: 'FOR PERSONAL TAXES',
          alignment: 'right',
          style: 'footerNote',
          margin: [0, 10, 0, 0],
        },
      ], // Fin de content

      // Estilos (mapear desde clases CSS observadas en sheet.css y HTML)
      styles: {
        mainHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 5],
          color: '#434343',
        }, // Gris oscuro
        subHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 10],
          color: '#666666',
        }, // Gris medio
        info: { fontSize: 9, color: '#333333' },
        tableHeader: {
          // Estilo para JAN-MAR, TOTAL, etc. (Basado en .s8, .s9, .s10...?)
          bold: true,
          fontSize: 9,
          color: '#000000', // Negro
          fillColor: '#FCE5CD', // Naranja pálido (ajustar color según HTML)
          alignment: 'center',
          margin: [0, 4, 0, 4], // Padding vertical
        },
        sectionHeader: {
          // Estilo para "Revenues - Sales", etc. (Basado en .s18?)
          bold: true,
          fontSize: 10,
          fillColor: '#FFF2CC', // Amarillo pálido (ajustar color según HTML)
          margin: [0, 5, 0, 2], // Espaciado vertical
          // border: [false, false, false, true] // Solo borde inferior? Controlado por layout
        },
        label: {
          // Estilo para celdas de descripción (Basado en .s21?)
          fontSize: 9,
          alignment: 'left',
          margin: [2, 2, 2, 2], // Padding pequeño
        },
        labelBold: {
          // Estilo para etiquetas de total
          fontSize: 9,
          bold: true,
          alignment: 'left',
          margin: [2, 2, 2, 2],
        },
        numeric: {
          // Estilo para celdas numéricas (Basado en .s22?)
          fontSize: 9,
          alignment: 'right',
          margin: [2, 2, 2, 2],
        },
        numericBold: {
          // Estilo para celdas numéricas en negrita (totales)
          fontSize: 9,
          bold: true,
          alignment: 'right',
          margin: [2, 2, 2, 2],
        },
        footerNote: {
          fontSize: 8,
          italics: true,
          color: '#666666',
        },
      }, // Fin de styles

      defaultStyle: {
        // font: 'Times', // Asegúrate que esta fuente esté configurada
        fontSize: 10,
        columnGap: 10,
      },
    };
    // --- FIN: Definición del Documento PDFMake ---

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
