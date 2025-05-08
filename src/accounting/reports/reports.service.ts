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
          table: {
            widths: [60, '*', '*'],
            body: [
              [
                { rowSpan: 2, text: 'AT', fontSize: 42 },
                {
                  text: 'ASCENCIO TAX INC.',
                  bold: true,
                  fontSize: 20,
                  alignment: 'center',
                },
                {
                  text: 'NOMBRE / TELEFONO\n',
                  fontSize: 12,
                  bold: true,
                  alignment: 'center',
                },
              ],
              [
                '',
                {
                  text: 'Personal and Business Income Tax Services',
                  alignment: 'center',
                },
                {
                  text: 'Income Tax 2025',
                  alignment: 'center',
                  bold: true,
                  fontSize: 16,
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                { text: 'NOTES:', bold: true, colSpan: 4 },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
              [
                { text: 'DESCRIPTION', style: 'tableHeader' },
                { text: 'GROSS', style: 'tableHeader' },
                { text: 'HST (13%)', style: 'tableHeader' },
                { text: 'NET', style: 'tableHeader' },
              ],
              [
                { text: 'Revenues - Sales', bold: true, colSpan: 4 },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
              [
                {
                  text: 'From Business Account - Deposit',
                  margin: [10, 0, 0, 0],
                },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                {
                  text: 'From Business Account - E-transfer',
                  margin: [10, 0, 0, 0],
                },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Total Revenue', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
              ],
              [
                {
                  text: 'BALANCE ON 1/1/2025 - 31/12/2025',
                  bold: true,
                  fillColor: '#cccccc',
                },
                { text: '0.00', alignment: 'center', colSpan: 3, bold: true },
                '',
                '',
              ],
            ],
          },
        },

        {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                {
                  text: 'Expenses with out HST',
                  bold: true,
                  colSpan: 4,
                  fillColor: '#ccc',
                },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
              [
                { text: 'Bank Fees', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Bank Interes', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Business Lisences ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Business Insurance', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Vehicle Insurance ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'GST', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'WSIB', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Sub-Contracts', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Payroll', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Union Fee ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Total', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
              ],
            ],
          },
        },
        {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                {
                  text: 'Motor Vehicle Expenses (Business)',
                  bold: true,
                  colSpan: 4,
                  fillColor: '#ccc',
                },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
              [
                { text: 'Gasoline', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: '407 Ert', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Parking', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Parking Fines', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Repair/ Maintenance Car', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Licence/ Registration ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Car Wash', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Lease Payments', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Purchase/ Financing', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],

              [
                { text: 'Total', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
              ],
            ],
          },
        },

        {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                {
                  text: 'Business-use-of- home (Utilities)',
                  bold: true,
                  colSpan: 4,
                  fillColor: '#ccc',
                },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
              [
                { text: 'Rental Water Heater', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Gas Natural', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Hydro/ Electricity', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Water', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Maintenance & Repairs', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Interest Mortgage', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Property Tax Bill', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Home Insurance', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],

              [
                { text: 'Total', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
                { text: '0.00', alignment: 'right', bold: true },
              ],
            ],
          },
        },

        {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                {
                  text: 'Expenses with out HST + Expenses + Motor Vehicle Expenses',
                  bold: true,
                  fillColor: '#ccc',
                },
                {
                  text: '0.00',
                  alignment: 'right',
                  bold: true,
                  fillColor: '#ccc',
                },
                {
                  text: '0.00',
                  alignment: 'right',
                  bold: true,
                  fillColor: '#ccc',
                },
                {
                  text: '0.00',
                  alignment: 'right',
                  bold: true,
                  fillColor: '#ccc',
                },
              ],
            ],
          },
        },

        {
          margin: [0, 0, 0, 10],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                {
                  text: 'Total Revenue NET - Total Expenses GROSS = PROFIT',
                  bold: true,
                  fillColor: '#ccc',
                },
                {
                  text: '0.00',
                  alignment: 'right',
                  bold: true,
                  fillColor: '#ccc',
                },
                { text: '', border: [false, false, false, false] },
                { text: '', border: [false, false, false, false] },
              ],
            ],
          },
        },

        {
          margin: [0, 0, 0, 20],
          table: {
            widths: ['*', 60, 60, 60],
            body: [
              [
                { text: '*MEDICAL EXPENSES', bold: true, fillColor: '#ccc' },
                {
                  text: '0.00',
                  alignment: 'right',
                  bold: true,
                  fillColor: '#ccc',
                },
                {
                  text: 'FOR PERSONAL TAXES',
                  colSpan: 2,
                  rowSpan: 2,
                  margin: [0, 10, 0, 0],
                },
                { text: '' },
              ],
              [
                { text: '*RENTA', bold: true, fillColor: '#ccc' },
                {
                  text: '0.00',
                  alignment: 'right',
                  bold: true,
                  fillColor: '#ccc',
                },
                { text: '' },
                { text: '' },
              ],
            ],
          },
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
