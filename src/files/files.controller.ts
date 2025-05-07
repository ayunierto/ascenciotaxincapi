import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';
import { v2 as cloudinary, UploadStream } from 'cloudinary';
import { Auth } from 'src/auth/decorators';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Auth()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: FileFilter,
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('Make sure that the file is an image');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
      const base64Image = Buffer.from(file.buffer).toString('base64');

      // Upload an image
      const uploadResult = await cloudinary.uploader.upload_large(
        `data:image/png;base64,${base64Image}`,
      );

      console.log(uploadResult);

      if (uploadResult instanceof UploadStream) {
        console.log('UploadStream:', uploadResult);
      } else {
        console.log('Upload Result:', uploadResult.secure_url);
        return { image: uploadResult.secure_url };
      }
    } catch (error) {
      console.error(error);
      return new BadRequestException('Upload Failed');
    }
  }
}
