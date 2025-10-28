import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadStream } from 'cloudinary';
import streamifier from 'streamifier';

@Injectable()
export class FilesService {
  constructor() {
    const cloud_name = process.env.CLOUDINARY_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud_name || !api_key || !api_secret) {
      throw new Error('Missing Cloudinary configuration');
    }

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'temp_files',
  ): Promise<UploadApiResponse | UploadStream> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'jpg',
          // transformation: [
          //   { quality: 'auto', fetch_format: 'auto' }, //
          // ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async move(oldPublicId: string, newPublicId: string) {
    return await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      overwrite: true, // Replace the file if it already exists
    });
  }

  async delete(publicId: string) {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException('Delete Failed');
    }
  }
}
