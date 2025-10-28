import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      //   {
      //   fileFilter: FileFilter,
      // }
    ),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.upload(file);
  }

  @Delete(':publicId')
  async deleteFile(@Param('publicId') publicId: string) {
    return this.filesService.delete(publicId);
  }
}
