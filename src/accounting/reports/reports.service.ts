import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Report } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
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

    // Complete a section of the table
    const getTableRows = (categoryName: string, subcategories: string[]) => {
      const categoryData = expensesData.expensesByCategory[categoryName] || {
        total: { gross: 0, hst: 0, net: 0 },
      };

      const rows: TableCell[][] = subcategories.map((subcat) => [
        { text: subcat, margin: [10, 0, 0, 0], bold: false },
        {
          text: categoryData[subcat]
            ? categoryData[subcat].gross.toFixed(2)
            : '0.00',
          alignment: 'right',
        },
        {
          text: categoryData[subcat]
            ? categoryData[subcat].hst.toFixed(2)
            : '0.00',
          alignment: 'right',
        },
        {
          text: categoryData[subcat]
            ? categoryData[subcat].net.toFixed(2)
            : '0.00',
          alignment: 'right',
        },
      ]);

      rows.push([
        {
          text: 'Total',
          alignment: 'left',
          bold: true,
        },
        {
          text: categoryData.total.gross.toFixed(2) || '0.00',
          alignment: 'right',
          bold: true,
        },
        {
          text: categoryData.total.hst.toFixed(2) || '0.00',
          alignment: 'right',
          bold: true,
        },
        {
          text: categoryData.total.net.toFixed(2) || '0.00',
          alignment: 'right',
          bold: true,
        },
      ]);

      return rows;
    };

    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 30], // Ajustado [L, T, R, B] para más espacio de cabecera

      content: [
        // Header
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
                  text: `${user.firstName} ${user.lastName} / ${user.phoneNumber}`,
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
        // First section with date range
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
                { text: 'DESCRIPTION', style: 'tableHeaderField' },
                { text: 'GROSS', style: 'tableHeaderField' },
                { text: 'HST (13%)', style: 'tableHeaderField' },
                { text: 'NET', style: 'tableHeaderField' },
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
                  text: `BALANCE ON ${new Date(startDate).toLocaleDateString()} - ${new Date(
                    endDate,
                  ).toLocaleDateString()}`,
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
        // For Expenses with out HST table
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
        // For the first Expenses table
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
              ...getTableRows('Expenses', [
                'Advertising/ Promotion',
                'Meals/ Entertainment',
                'Expenses office',
                'Expenses supplies',
                'Office Stationery',
                'Office Rental',
                'Office Utilities',
                'Office Phone',
                'Office Internet',
                'Office maintenance/ Repairs',
                'Storage Rent',
                'Uniform',
                'Rental Equipment/ Car Rental',
                'Accounting/ Legal/ Other professional Fees',
                'Memberships/ Subscriptions',
              ]),
            ],
          },
        },
        // For the second Motor Vehicle Expenses table
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
            ],
          },
        },
        // For the third Business-use-of-home (Utilities) table
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
              ...getTableRows('Business-use-of- home (Utilities)', [
                'Rental Water Heater',
                'Gas Natural',
                'Hydro/ Electricity',
                'Water',
                'Maintenance & Repairs',
                'Interest Mortgage',
                'Property Tax Bill',
                'Home Insurance',
              ]),
            ],
          },
        },
        // For the fourth Expenses with out HST + Expenses + Motor Vehicle Expenses table
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
        // For the Total Revenue NET - Total Expenses GROSS = PROFIT table
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
                  text: expensesData.expensesByCategory['Medical Expenses']
                    ? Number(
                        expensesData.expensesByCategory['Medical Expenses']
                          .total.gross,
                      ).toFixed(2)
                    : '0.00',
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
                  text: expensesData.expensesByCategory['Rent']
                    ? Number(
                        expensesData.expensesByCategory['Rent'].total.gross,
                      ).toFixed(2)
                    : '0.00',
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
        tableHeaderField: {
          bold: true,
          fillColor: '#ccc',
          alignment: 'center',
        },
        tableHeader: {
          bold: true,

          fillColor: '#ccc',
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
      throw new BadRequestException('Unable to create plans');
    }
  }

  async findAll(paginationDto: PaginationDto, user: User): Promise<Report[]> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const userReportLogs = await this.reportRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        order: {
          createdAt: 'DESC',
        },
      });
      return userReportLogs;
    } catch (error) {
      throw new InternalServerErrorException('Unable to find reports');
    }
  }
}
