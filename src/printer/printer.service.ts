import { Injectable } from '@nestjs/common';

import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Bold.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-BoldItalic.ttf',
  },
  Times: {
    normal: 'fonts/Times-New-Roman.ttf',
    bold: 'fonts/Times-New-Roman-Bold.ttf',
    italics: 'fonts/Times-New-Roman-Italic.ttf',
    bolditalics: 'fonts/Times-New-Roman-Bold-Italic.ttf',
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  createPdf(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }
}
