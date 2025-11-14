import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ServicesService } from 'src/services/services.service';
import { UsersService } from '../users/users.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { StaffService } from 'src/staff/staff.service';
import { PostsService } from '../blog/posts/posts.service';
import { CategoriesService } from 'src/accounting/categories/categories.service';
import { SubcategoriesService } from '../accounting/subcategories/subcategories.service';
import { Role } from 'src/auth/enums/role.enum';
import { SettingsService } from 'src/settings/settings.service';
import { AppVersionsService } from 'src/app-versions/app-versions.service';
import { AppPlatform } from 'src/app-versions/entities/app-version.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
    private readonly scheduleService: ScheduleService,
    private readonly staffService: StaffService,
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly subcategoriesService: SubcategoriesService,
    private readonly settingsService: SettingsService,
    private readonly appVersionService: AppVersionsService,
  ) {}

  async runSeed() {
    try {
      const settings = await this.settingsService.getSettings();
      if (settings) {
        return {
          message: 'Seed already executed',
          status: 'failed',
        };
      }

      await this.settingsService.create({
        timeZone: 'America/Toronto',
        locale: 'en-CA',
        executedSeed: true,
      });

      await this.appVersionService.create({
        platform: AppPlatform.ALL,
        minSupportedVersion: '1.0.0',
        latestVersion: '1.0.0',
        forceUpdate: false,
      });

      // await this.usersService.create({
      //   firstName: 'Alcides',
      //   lastName: 'Turruellas',
      //   email: 'ayunierto@gmail.com',
      //   password: 'Abc123',
      //   timeZone: 'America/Lima',
      //   isActive: true,
      //   isEmailVerified: true,
      //   roles: [Role.SuperUser, Role.Staff, Role.Admin, Role.User],
      //   lastLoginAt: new Date(),
      // });

      // Create users
      const yulierUser = await this.usersService.create({
        firstName: 'Yulier',
        lastName: 'Rondon',
        email: 'rondonyulier@gmail.com',
        timeZone: 'America/Toronto',
        // phoneNumber: '+16474669318',
        // password: await this.utilityService.hashPassword('Abcd1234'),
        password: bcrypt.hashSync('Abcd1234', 10),
        isActive: true,
        isEmailVerified: true,
        roles: [Role.Staff, Role.Admin],
      });

      // Create Schedule
      // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday,
      const mondaySchedule = await this.scheduleService.create({
        dayOfWeek: 1,
        startTime: '09:30',
        endTime: '19:30',
      });
      const tuesdaySchedule = await this.scheduleService.create({
        dayOfWeek: 2,
        startTime: '09:30',
        endTime: '19:30',
      });
      const wednesdaySchedule = await this.scheduleService.create({
        dayOfWeek: 3,
        startTime: '09:30',
        endTime: '19:30',
      });
      const thursdaySchedule = await this.scheduleService.create({
        dayOfWeek: 4,
        startTime: '09:30',
        endTime: '19:30',
      });
      const fridaySchedule = await this.scheduleService.create({
        dayOfWeek: 5,
        startTime: '09:30',
        endTime: '19:30',
      });

      // Create staff members
      const yulierStaff = await this.staffService.create({
        firstName: 'Yulier',
        lastName: 'Rondon',
        isActive: true,
        services: [],
        schedules: [
          mondaySchedule.id,
          tuesdaySchedule.id,
          wednesdaySchedule.id,
          thursdaySchedule.id,
          fridaySchedule.id,
        ],
      });
      const luciaStaff = await this.staffService.create({
        firstName: 'Lucia',
        lastName: 'Ascencio',
        isActive: true,
        services: [],
        schedules: [
          mondaySchedule.id,
          tuesdaySchedule.id,
          wednesdaySchedule.id,
          thursdaySchedule.id,
          fridaySchedule.id,
        ],
      });

      // Create services
      await this.servicesService.create({
        name: 'In-person Tax Filing (Walk-in)',
        description:
          'Our in-person tax filing service offers a convenient and efficient way to handle your tax obligations. Simply walk into our office, and our experienced tax professionals will guide you through the process, ensuring accuracy and compliance with the latest tax regulations. No appointment needed, just bring your documents, and we will take care of the rest.',
        isAvailableOnline: false,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png',
        staffIds: [yulierStaff.id, luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Personal Income Tax',
        description:
          'Our personal income tax service simplifies the annual tax filing process for individuals. We help you navigate complex tax laws, identify eligible deductions and credits, and ensure accurate and timely submission of your tax returns. Maximize your refund and minimize your stress with our expert assistance.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/21276e9bb2a04809a76f2a7bfe161219.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/21276e9bb2a04809a76f2a7bfe161219.jpg',
        staffIds: [yulierStaff.id, luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Corporate Taxes',
        description:
          'Our corporate tax service helps businesses of all sizes manage their tax obligations effectively. We provide comprehensive tax planning, preparation, and filing to ensure compliance and optimize tax strategies. Let us handle the complexities of corporate taxes so you can focus on growing your business.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg',
        staffIds: [yulierStaff.id, luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Self-Employed & Small Business Tax',
        description:
          'Tailored for freelancers, contractors, and small business owners, our tax service addresses the unique challenges of self-employment. We help you track expenses, claim all eligible deductions, and file your taxes accurately to maximize your returns and ensure compliance with CRA regulations.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png',
        staffIds: [yulierStaff.id, luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'GST/HST or WSIB Report',
        description:
          'We provide expert assistance with the preparation and filing of your GST/HST and WSIB reports. Our service ensures that your reports are accurate, submitted on time, and fully compliant with government requirements, helping you avoid penalties and manage your business finances smoothly.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg/v1/fill/w_239,h_154,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg',
        staffIds: [luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Business Registration',
        description:
          'Start your business on the right foot with our business registration service. We guide you through the process of selecting the right business structure and registering your company with the appropriate government agencies, ensuring you meet all legal requirements from day one.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg',
        staffIds: [luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Rental Income Taxes',
        description:
          'Navigating the tax implications of rental income can be complex. Our specialized service helps property owners accurately report rental income and expenses, claim all eligible deductions, and comply with tax laws, ensuring you optimize your financial returns from your rental properties.',

        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg',
        staffIds: [yulierStaff.id, luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Social insurance number for non-resident',
        description:
          'Our service assists non-residents in obtaining a Social Insurance Number (SIN) in Canada. We guide you through the application process, ensuring all necessary documentation is correctly prepared and submitted, which is essential for working and accessing government programs and benefits in Canada.',

        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,lg_1,q_80,enc_auto/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg',
        staffIds: [yulierStaff.id, luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Canada Child Benefit Application',
        description:
          'The Canada Child Benefit (CCB) is a tax-free monthly payment made to eligible families to help with the cost of raising children under 18 years of age. Our service helps you determine your eligibility and assists with the application process to ensure you receive the benefits you are entitled to.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg',
        staffIds: [luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Canada Pension Plan(CPP) Application',
        description:
          'The Canada Pension Plan (CPP) retirement pension is a monthly, taxable benefit that replaces part of your income when you retire. We can help you understand your eligibility and guide you through the application process to start receiving your pension.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg',
        staffIds: [luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });
      await this.servicesService.create({
        name: 'Old Age Security Application',
        description:
          'The Old Age Security (OAS) pension is a monthly payment you can get if you are 65 and older. Our service assists you in navigating the application process, helping you to secure this important retirement income.',
        isAvailableOnline: true,
        isActive: true,
        durationMinutes: 60,
        imageUrl:
          'https://static.wixstatic.com/media/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png',
        staffIds: [luciaStaff.id],
        address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
      });

      // Create posts for the blog
      await this.postsService.create(
        {
          title:
            'How Can You Take Advantage of Unclaimed Deductions for Remote Work Expenses?',
          url: 'https://www.ascenciotax.com/post/how-can-you-take-advantage-of-unclaimed-deductions-for-remote-work-expenses',
        },
        yulierUser,
      );
      await this.postsService.create(
        {
          title: 'What you need to know for the 2024 tax-filing season',
          url: 'https://www.ascenciotax.com/post/what-you-need-to-know-for-the-2024-tax-filing-season',
        },
        yulierUser,
      );
      await this.postsService.create(
        {
          title: 'Top 10 tax-saving tips for small business owners',
          url: 'https://www.ascenciotax.com/post/top-10-tax-saving-tips-for-small-business-owners',
        },
        yulierUser,
      );
      await this.postsService.create(
        {
          title:
            'The impact of recent tax law changes on individuals and businesses',
          url: 'https://www.ascenciotax.com/post/the-impact-of-recent-tax-law-changes-on-individuals-and-businesses',
        },
        yulierUser,
      );
      await this.postsService.create(
        {
          title:
            'Five common tax filing mistakes and how to avoid them at tax time!',
          url: 'https://www.ascenciotax.com/post/common-tax-filing-mistakes',
        },
        yulierUser,
      );

      // Create main default categories
      const expenses = await this.categoriesService.create({
        name: 'Expenses',
        description: 'Category for expenses',
      });
      const motorVehicleExpensesBusiness = await this.categoriesService.create({
        name: 'Motor Vehicle Expenses (Business)',
        description: 'Category for expenses related to motor vehicles',
      });
      const businessUseOfHomeUtilities = await this.categoriesService.create({
        name: 'Business-use-of- home (Utilities)',
        description: 'Category for expenses related to business-use-of-home',
      });
      await this.categoriesService.create({
        name: 'Medical Expenses',
        description: 'FOR PERSONAL TAXES',
      });
      await this.categoriesService.create({
        name: 'Rent',
        description: 'FOR PERSONAL TAXES',
      });

      // Create default subcategories
      await this.subcategoriesService.create({
        name: 'Office Rental',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Office Utilities',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Office Phone',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Office Internet',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Office maintenance/ Repairs ',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Storage Rent',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Uniform',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Rental Equipment/ Car Rental',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Accounting/ Legal/ Other professional Fees',
        categoryId: expenses.id,
      });
      await this.subcategoriesService.create({
        name: 'Memberships/ Subscriptions',
        categoryId: expenses.id,
      });
      // Subcategories for motor vehicles expenses
      await this.subcategoriesService.create({
        name: 'Gasoline',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: '407 Ert',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'Parking',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'Parking Fines',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'Repair/ Maintenance Car',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'License/ Registration',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'Car Wash',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'Lease Payments ',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      await this.subcategoriesService.create({
        name: 'Purchase/ Financing',
        categoryId: motorVehicleExpensesBusiness.id,
      });
      // Subcategories for Business-use-of- home (Utilities)
      await this.subcategoriesService.create({
        name: 'Rental Water Heater',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Gas Natural',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Hydro/ Electricity',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Water',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Maintenance & Repairs',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Interest Mortgage',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Property Tax Bill',
        categoryId: businessUseOfHomeUtilities.id,
      });
      await this.subcategoriesService.create({
        name: 'Home Insurance',
        categoryId: businessUseOfHomeUtilities.id,
      });

      return {
        message: 'Seed Executed',
        status: 'ok',
      };
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }
}
