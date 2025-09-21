import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FilesService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file)
      throw new BadRequestException('Make sure that the file is an image');

    try {
      const base64Image = Buffer.from(file.buffer).toString('base64');

      // Upload an image
      const uploadResult = await cloudinary.uploader.upload_large(
        `data:image/png;base64,${base64Image}`,
      );

      // TODO: Remove console log in production
      console.log(uploadResult);

      if ('public_id' in uploadResult) {
        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
          fetch_format: 'auto',
          quality: 'auto',
        });
        return optimizeUrl;
      }

      // TODO: Remove console log in production
      console.log('UploadStream:', uploadResult);

      throw new BadRequestException('Upload Failed');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Upload Failed');
    }
  }
}
