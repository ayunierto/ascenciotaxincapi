import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  async extractTextFromImage(
    url: string,
    language: string = 'eng',
  ): Promise<string> {
    const {
      data: { text },
    } = await Tesseract.recognize(url, language);
    return text;
  }
}
