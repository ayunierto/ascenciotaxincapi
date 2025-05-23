import { BadRequestException, Injectable } from '@nestjs/common';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrinterService } from 'src/printer/printer.service';
import { ExpenseService } from '../expenses/expenses.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    private readonly printer: PrinterService,
    private readonly expenseService: ExpenseService,
  ) {}

  async generatePdfReport(
    createReportDto: CreateReportDto,
    user: User,
  ): Promise<PDFKit.PDFDocument> {
    const { startDate, endDate } = createReportDto;
    const expensesData = await this.expenseService.findAllByDateRange(
      new Date(startDate),
      new Date(endDate),
      user,
    );

    console.log(expensesData);

    // Función helper para formatear números
    // const formatNumber = (num: number) => num.toFixed(2);

    // Ejemplo de cómo rellenar una sección de la tabla
    const getTableRows = (categoryName: string, subcategories: string[]) => {
      const categoryData = expensesData.expensesByCategory[categoryName] || {
        total: { gross: 0, hst: 0, net: 0 },
      };

      const rows = subcategories.map((subcat) => [
        { text: subcat, margin: [10, 0, 0, 0] },
        {
          text: categoryData[subcat] ? categoryData[subcat].gross : '0.00',
          alignment: 'right',
        },
        {
          text: categoryData[subcat] ? categoryData[subcat].hst : '0.00',
          alignment: 'right',
        },
        {
          text: categoryData[subcat] ? categoryData[subcat].net : '0.00',
          alignment: 'right',
        },
      ]);

      rows.push([
        { text: 'Total', margin: [10, 0, 0, 0] },
        {
          text: categoryData.total.gross || '0.00',
          alignment: 'right',
        },
        {
          text: categoryData.total.hst || '0.00',
          alignment: 'right',
        },
        {
          text: categoryData.total.net || '0.00',
          alignment: 'right',
        },
      ]);

      return rows;
    };

    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 30], // Ajustado [L, T, R, B] para más espacio de cabecera

      content: [
        {
          table: {
            widths: [90, '*', '*'],
            body: [
              [
                {
                  rowSpan: 2,
                  text: 'AT',
                  fontSize: 42,
                  font: 'Times',
                  color: '#002e5d',
                  bold: true,
                },
                {
                  text: 'ASCENCIO TAX INC.',
                  bold: true,
                  fontSize: 20,
                  alignment: 'center',
                  font: 'Times',
                },
                {
                  text: `${user.name} ${user.lastName}  / ${user.countryCode} ${user.phoneNumber}`,
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
                  font: 'Times',
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
                  text: 'Expenses',
                  bold: true,
                  colSpan: 4,
                  fillColor: '#ccc',
                },
                { text: '' },
                { text: '' },
                { text: '' },
              ],
              [
                { text: 'Advertising/ Promotion', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Meals/ Entertainment ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Expenses office', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Expenses supplies', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Office Stationery', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Office Rental', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Office Utilities ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Office Phone ', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Office Internet', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Office maintenance/ Repairs', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Storage Rent', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Uniform', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Rental Equipment/ Car Rental', margin: [10, 0, 0, 0] },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                {
                  text: 'Accounting/ Legal/ Other professional Fees',
                  margin: [10, 0, 0, 0],
                },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
                { text: '0.00', alignment: 'right' },
              ],
              [
                { text: 'Memberships/ Subscriptions', margin: [10, 0, 0, 0] },
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
              ...getTableRows('Motor Vehicle Expenses (Business)', [
                'Gasoline',
                '407 Ert',
                'Parking',
                'Parking Fines',
                'Repair/ Maintenance Car',
                'Licence/ Registration ',
                'Car Wash',
                'Lease Payments',
                'Purchase/ Financing',
              ]),

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
      ],

      styles: {
        tableHeader: {
          bold: true,
          fillColor: '#ccc',
          alignment: 'center',
        },
      },

      defaultStyle: {
        font: 'Roboto', // Asegúrate que esta fuente esté configurada
        fontSize: 10,
      },
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
