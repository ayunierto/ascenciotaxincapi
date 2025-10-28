import { Injectable } from '@nestjs/common';
import { CreateCloudinaryDto } from './dto/create-cloudinary.dto';
import { UpdateCloudinaryDto } from './dto/update-cloudinary.dto';

@Injectable()
export class CloudinaryService {
  create(createCloudinaryDto: CreateCloudinaryDto) {
    return 'This action adds a new cloudinary';
  }

  findAll() {
    return `This action returns all cloudinary`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudinary`;
  }

  update(id: number, updateCloudinaryDto: UpdateCloudinaryDto) {
    return `This action updates a #${id} cloudinary`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudinary`;
  }
}
