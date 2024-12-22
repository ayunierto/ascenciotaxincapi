import { ValidRoles } from 'src/auth/interfaces';
import { CreateScheduleDto } from 'src/schedule/dto/create-schedule.dto';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { CreateStaffDto } from 'src/staff/dto/create-staff.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

interface SeedData {
  users: CreateUserDto[];
  staff: CreateStaffDto[];
  services: CreateServiceDto[];
  schedule: CreateScheduleDto[];
}

export const initialData: SeedData = {
  users: [
    {
      name: 'Yulier',
      lastName: 'Rondon',
      email: 'yrondon@ascenciotaxinc.com',
      phoneNumber: '+10000000001',
      password: 'Abcd1234',
      birthdate: new Date('2000-01-01'),
      registrationDate: new Date(),
      isActive: true,
      roles: [ValidRoles.staff],
    },
    {
      name: 'Lucia',
      lastName: 'Ascencio',
      email: 'lucia@ascenciotaxinc.com',
      phoneNumber: '+10000000002',
      password: 'Abcd1234',
      birthdate: new Date('2000-01-01'),
      registrationDate: new Date(),
      isActive: true,
      roles: [ValidRoles.staff],
    },
  ],
  staff: [
    {
      name: 'Yulier',
      lastName: 'Rondon',
      isActive: true,
      services: [],
    },
    {
      name: 'Lucia',
      lastName: 'Ascencio',
      isActive: true,
      services: [],
    },
  ],
  services: [
    {
      name: 'In-person Tax Filing (Walk-in)',
      isAvailableOnline: false,
      isActive: true,
      duration: 45,
      images: [
        'https://static.wixstatic.com/media/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Personal Income Tax',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/21276e9bb2a04809a76f2a7bfe161219.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/21276e9bb2a04809a76f2a7bfe161219.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Corporate Taxes',
      isAvailableOnline: true,
      isActive: true,
      duration: 90,
      images: [
        'https://static.wixstatic.com/media/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Self-Employed & Small Business Tax',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'GST/HST or WSIB Report',
      isAvailableOnline: true,
      isActive: true,
      duration: 45,
      images: [
        'https://static.wixstatic.com/media/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg/v1/fill/w_239,h_154,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Business Registration',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Rental Income Taxes',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Social insurance number for non-resident',
      isAvailableOnline: true,
      isActive: true,
      duration: 45,
      images: [
        'https://static.wixstatic.com/media/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,lg_1,q_80,enc_auto/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Canada Child Benefit Application',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Canada Pension Plan(CPP) Application',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg',
      ],
      staff: [],
      price: 0,
    },
    {
      name: 'Old Age Security Application',
      isAvailableOnline: true,
      isActive: true,
      duration: 60,
      images: [
        'https://static.wixstatic.com/media/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png',
      ],
      staff: [],
      price: 0,
    },
  ],
  schedule: [
    {
      weekday: 1,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
    {
      weekday: 2,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
    {
      weekday: 3,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
    {
      weekday: 4,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
    {
      weekday: 5,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
    {
      weekday: 6,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
    {
      weekday: 7,
      startTime: '08:00:00',
      endTime: '17:00:00',
      staff: '',
    },
  ],
};
