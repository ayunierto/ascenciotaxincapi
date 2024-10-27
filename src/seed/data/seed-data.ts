import * as bcrypt from 'bcrypt';

interface SeedService {
  title: string;
  isAvailableOnline: boolean;
  isActive: boolean;
  duration: string;
  description?: string;
  images: string[];
}
interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

interface SeedData {
  users: SeedUser[];
  services: SeedService[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'test1@google.com',
      fullName: 'Test One',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['admin'],
    },
    {
      email: 'test2@google.com',
      fullName: 'Test Two',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['super-admin'],
    },
    {
      email: 'test3@google.com',
      fullName: 'Test Three',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['user'],
    },
  ],
  services: [
    {
      title: 'In-person Tax Filing (Walk-in)',
      isAvailableOnline: false,
      isActive: true,
      duration: '45 min',
      images: [],
    },
    {
      title: 'Personal Income Tax',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
    {
      title: 'Corporate Taxes',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr 30 min',
      images: [],
    },
    {
      title: 'Self-Employed & Small Business Tax',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
    {
      title: 'GST/HST or WSIB Report',
      isAvailableOnline: true,
      isActive: true,
      duration: '45 min',
      images: [],
    },
    {
      title: 'Business Registration',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
    {
      title: 'Rental Income Taxes',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
    {
      title: 'Social insurance number for non-resident',
      isAvailableOnline: true,
      isActive: true,
      duration: '45 min',
      images: [],
    },
    {
      title: 'Canada Child Benefit Application',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
    {
      title: 'Canada Pension Plan(CPP) Application',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
    {
      title: 'Old Age Security Application',
      isAvailableOnline: true,
      isActive: true,
      duration: '1 hr',
      images: [],
    },
  ],
};
