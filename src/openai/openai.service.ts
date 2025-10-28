import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { CategoriesService } from 'src/accounting/categories/categories.service';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(private readonly categoriesService: CategoriesService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

    this.openai = new OpenAI({
      apiKey,
    });
  }

  /**
   * Analyzes receipt text using OpenAI's GPT model to extract structured data.
   *
   * @param text The receipt text to analyze.
   * @returns A JSON object containing the extracted merchant, tax, date, total, category, and subcategory.
   */
  async analyzeReceiptText(text: string) {
    const categories = await this.categoriesService.findAll();

    const prompt = `
Extract this data from the receipt text and :
- merchant
- date (YYYY-MM-DD)
- total
- tax
- categoryId (the id of the best matching category)
- subcategoryId (the id of the best matching subcategory)

Categories:
${JSON.stringify(categories, null, 2)}

If any field is unknown, leave it empty "".
Return ONLY valid JSON like:
{"merchant":"","date":"","total":"","tax":"","categoryId":"","subcategoryId":""}

Receipt text:
"""${text}"""
`;

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You extract structured data from receipt text.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return JSON.parse(res.choices[0].message.content);
  }
}
