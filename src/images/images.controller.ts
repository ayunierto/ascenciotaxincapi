import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './filter/fileFilter.helper';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: FileFilter,
    }),
  )
  upload(@UploadedFile() image: Express.Multer.File) {
    if (!image)
      throw new BadRequestException('Make sure that the file is an image');

    return this.imagesService.upload(image);
  }

  @Get(':public_id')
  findOne(@Param('public_id') public_id: string) {
    return this.imagesService.findOne(public_id);
  }

  @Patch(':public_id')
  update(@Param('public_id') public_id: string, image: Express.Multer.File) {
    if (!image)
      throw new BadRequestException('Make sure that the file is an image');

    return this.imagesService.update(public_id, image);
  }

  @Delete(':public_id')
  remove(@Param('public_id') public_id: string) {
    return this.imagesService.remove(public_id);
  }
}
