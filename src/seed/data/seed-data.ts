import * as bcrypt from 'bcrypt';

interface SeedService {
  title: string;
  isAvailableOnline: boolean;
  isActive: boolean;
  duration: string;
  description?: string;
  images: string[];
  staffMembers: string[];
}
interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

interface SeedStaff {
  name: string;
}

interface SeedData {
  users: SeedUser[];
  staff: SeedStaff[];
  services: SeedService[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'test1@google.com',
      fullName: 'Test One (super-admin)',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['super-admin', 'admin'],
      isActive: true,
    },
    {
      email: 'test2@google.com',
      fullName: 'Test Two (admin)',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['admin'],
      isActive: true,
    },
    {
      email: 'test3@google.com',
      fullName: 'Test Three (user)',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user'],
      isActive: true,
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
      title: 'In-person Tax Filing (Walk-in)',
      isAvailableOnline: false,
      isActive: true,
      duration: '45 min',
      images: [
        'https://static.wixstatic.com/media/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png',
      ],
      staffMembers: ['Lucia Ascencio', 'Yulier Rondon'],
    },
    {
      title: 'Personal Income Tax',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/21276e9bb2a04809a76f2a7bfe161219.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/21276e9bb2a04809a76f2a7bfe161219.jpg',
      ],
      staffMembers: ['Lucia Ascencio', 'Yulier Rondon'],
    },
    {
      title: 'Corporate Taxes',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr 30 min',
      images: [
        'https://static.wixstatic.com/media/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio', 'Yulier Rondon'],
    },
    {
      title: 'Self-Employed & Small Business Tax',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png',
      ],
      staffMembers: ['Lucia Ascencio', 'Yulier Rondon'],
    },
    {
      title: 'GST/HST or WSIB Report',
      isAvailableOnline: true,
      isActive: true,
      duration: '45 min',
      images: [
        'https://static.wixstatic.com/media/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg/v1/fill/w_239,h_154,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio'],
    },
    {
      title: 'Business Registration',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio'],
    },
    {
      title: 'Rental Income Taxes',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio', 'Yulier Rondon'],
    },
    {
      title: 'Social insurance number for non-resident',
      isAvailableOnline: true,
      isActive: true,
      duration: '45 min',
      images: [
        'https://static.wixstatic.com/media/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,lg_1,q_80,enc_auto/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio', 'Yulier Rondon'],
    },
    {
      title: 'Canada Child Benefit Application',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio'],
    },
    {
      title: 'Canada Pension Plan(CPP) Application',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg',
      ],
      staffMembers: ['Lucia Ascencio'],
    },
    {
      title: 'Old Age Security Application',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [
        'https://static.wixstatic.com/media/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png',
      ],
      staffMembers: ['Lucia Ascencio'],
    },
  ],
};
