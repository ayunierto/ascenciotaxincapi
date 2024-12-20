import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';

interface SeedService {
  name: string;
  isAvailableOnline: boolean;
  is_active: boolean;
  duration: string;
  description?: string;
  images: string[];
  staff: string[];
}
interface SeedUser {
  email: string;
  name: string;
  password: string;
  roles: string[];
  is_active: boolean;
}

interface SeedStaff {
  name: string;
}

interface SeedData {
  users: CreateUserDto[];
  staff: SeedStaff[];
  services: CreateServiceDto[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'test1@google.com',
      name: 'Test',
      password: bcrypt.hashSync('Abcd1234', 10),
      // roles: ['super-admin', 'admin'],
      // is_active: true,
      last_name: 'OneOne',
      phone_number: '',
      birthdate: new Date('2000-01-01'),
      // registration_date: undefined,
      last_login: undefined,
    },
    {
      email: 'test2@google.com',
      name: 'Test Two (admin)',
      password: bcrypt.hashSync('Abcd1234', 10),
      // roles: ['admin'],
      // is_active: true,
      last_name: '',
      phone_number: '',
      birthdate: new Date('2000-01-01'),
      // registration_date: undefined,
      last_login: undefined,
    },
    {
      email: 'test3@google.com',
      name: 'Test Three (user)',
      password: bcrypt.hashSync('Abcd1234', 10),
      // roles: ['user'],
      // is_active: true,
      last_name: '',
      phone_number: '',
      birthdate: new Date('2000-01-01'),
      // registration_date: undefined,
      last_login: undefined,
    },
  ],
  staff: [
    {
      name: 'Yulier Rondon',
    },
    {
      name: 'Lucia Ascencio',
    },
    {
      name: 'John Doe',
    },
  ],
  services: [
    {
      name: 'In-person Tax Filing (Walk-in)',
      is_available_online: false,
      is_active: true,
      duration: 45,
      images: [
        'https://static.wixstatic.com/media/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Personal Income Tax',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/21276e9bb2a04809a76f2a7bfe161219.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/21276e9bb2a04809a76f2a7bfe161219.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Corporate Taxes',
      is_available_online: true,
      is_active: true,
      duration: 90,
      images: [
        'https://static.wixstatic.com/media/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Self-Employed & Small Business Tax',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'GST/HST or WSIB Report',
      is_available_online: true,
      is_active: true,
      duration: 45,
      images: [
        'https://static.wixstatic.com/media/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg/v1/fill/w_239,h_154,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Business Registration',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Rental Income Taxes',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Social insurance number for non-resident',
      is_available_online: true,
      is_active: true,
      duration: 45,
      images: [
        'https://static.wixstatic.com/media/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,lg_1,q_80,enc_auto/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Canada Child Benefit Application',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Canada Pension Plan(CPP) Application',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Old Age Security Application',
      is_available_online: true,
      is_active: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png',
      ],
      staff: [],
      price: 0,
    },
  ],
};
