import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImagesService {
  constructor() {
    const cloud_name = process.env.CLOUDINARY_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud_name)
      throw new Error(
        'CLOUDINARY_NAME is not set in the environment variables.',
      );
    if (!api_key)
      throw new Error(
        'CLOUDINARY_API_KEY is not set in the environment variables.',
      );
    if (!api_secret)
      throw new Error(
        'CLOUDINARY_API_SECRET is not set in the environment variables.',
      );
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });
  }

  async upload(image: Express.Multer.File) {
    try {
      const base64Image = Buffer.from(image.buffer).toString('base64');
      const public_id = uuidv4();

      const options = {
        public_id,
      };

      const uploadResult = await cloudinary.uploader.upload_large(
        `data:image/png;base64,${base64Image}`,
        options,
      );

      const optimizeUrl = cloudinary.url(public_id, {
        fetch_format: 'auto',
        quality: 'auto',
      });
      return { image: optimizeUrl };
    } catch (error) {
      console.error(error);
      return new BadRequestException('Upload failed.');
    }
  }

  findOne(public_id: string) {
    return `This action returns a #${public_id} image`;
  }

  update(public_id: string, image: Express.Multer.File) {
    return `This action updates a #${public_id} image: ${image.originalname}`;
  }

  async remove(public_id: string) {
    try {
      const response = await cloudinary.uploader.destroy(public_id);
      return response;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('The image could not be deleted.');
    }
  }
}
