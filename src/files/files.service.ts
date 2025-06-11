import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  async uploadImage(file: Express.Multer.File) {
    let tempFilePath: string | null = null;

    console.warn({ file });
    try {
      this.logger.log('Upload image initialized');
      const tempDir = tmpdir();
      tempFilePath = join(tempDir, file.originalname);
      console.warn(tempFilePath);

      await writeFile(tempFilePath, file.buffer);
      this.logger.log(`Image saved in ${tempFilePath}`);

      this.uploadToCloudinary(tempFilePath);
    } catch (error) {
      this.logger.error(`Failed to write image`);
      console.error('Failed to write or process the temporary file:', error);
    } finally {
      if (tempFilePath) {
        try {
          this.logger.log(`Cleaning up. Deleting file: ${tempFilePath}`);
          await unlink(tempFilePath);
          this.logger.log('Temporary file deleted successfully.');
        } catch (cleanupError) {
          this.logger.error(`Failed to delete temporary file ${tempFilePath}`);
          // Log cleanup error, but don't let it hide the original error
          console.error(cleanupError);
        }
      }
    }

    this.logger.warn('Error in upload image');
  }

  async uploadToCloudinary(filePath: string) {
    this.logger.log(`Processing image at: ${filePath}`);
    try {
      // Configuration
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.AWS_SECRET_ACCESS_KEY,
      });

      // Upload an image
      const uploadResult = await cloudinary.uploader
        .upload(
          'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
          {
            folder: 'services',
          },
        )
        .catch((error) => {
          console.log(error);
        });

      console.log(uploadResult);

      if (uploadResult && 'public_id' in uploadResult) {
        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
          fetch_format: 'auto',
          quality: 'auto',
        });

        this.logger.log('Action performed successfully on the temporary file.');
        return {
          image: optimizeUrl,
        };
      }
    } catch (error) {
      console.error('The action on the file failed:', error);
      throw new InternalServerErrorException('The image could not be uploaded');
    }
  }
}
