import { Injectable } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { UsersService } from '../users/users.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { StaffService } from 'src/staff/staff.service';
import { ValidRoles } from 'src/auth/interfaces';
import { AppointmentService } from '../appointment/appointment.service';
import { PostsService } from '../blog/posts/posts.service';
import { CategoriesService } from 'src/accounting/categories/categories.service';
import { SubcategoryService } from '../accounting/subcategories/subcategories.service';
import { CurrencyService } from 'src/accounting/currencies/currencies.service';
import { AccountsTypesService } from 'src/accounting/accounts-types/accounts-types.service';
import { AccountService } from 'src/accounting/accounts/accounts.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
    private readonly scheduleService: ScheduleService,
    private readonly staffService: StaffService,
    private readonly appointmentService: AppointmentService,
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly subcategoryService: SubcategoryService,
    private readonly currencyService: CurrencyService,
    private readonly accountTypeService: AccountsTypesService,
    private readonly accountService: AccountService,
  ) {}

  async runSeed() {
    try {
      await this.deleteData();

      // Create users
      const alcidesUser = await this.usersService.create({
        name: 'Alcides Yunier',
        lastName: 'Turruellas Osorio',
        email: 'ayunierto@gmail.com',
        phoneNumber: '+51917732227',
        password: 'Alcides.92',
        birthdate: new Date('1992-10-28'),
        registrationDate: new Date(),
        isActive: true,
        roles: [ValidRoles.superUser, ValidRoles.admin],
      });
      const yulierUser = await this.usersService.create({
        name: 'Yulier',
        lastName: 'Rondon',
        email: 'rondonyulier@gmail.com',
        phoneNumber: '+16474669318',
        password: 'Abcd1234',
        birthdate: new Date('1993-01-18'),
        registrationDate: new Date(),
        isActive: true,
        roles: [ValidRoles.staff, ValidRoles.admin],
      });
      const luciaUser = await this.usersService.create({
        name: 'Lucia',
        lastName: 'Ascencio',
        email: 'lucia@ascenciotaxinc.com',
        phoneNumber: '+10000000002',
        password: 'Abcd1234',
        birthdate: new Date('2000-01-01'),
        registrationDate: new Date(),
        isActive: true,
        roles: [ValidRoles.superUser],
      });

      // Create Schedule
      // 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday
      // for luxon
      const scheduleMondayYulier = await this.scheduleService.create({
        weekday: 1,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleTuesdayYulier = await this.scheduleService.create({
        weekday: 2,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleWednesdayYulier = await this.scheduleService.create({
        weekday: 3,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleThursdayYulier = await this.scheduleService.create({
        weekday: 4,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleFridayYulier = await this.scheduleService.create({
        weekday: 5,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleMondayLucia = await this.scheduleService.create({
        weekday: 1,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleTuesdayLucia = await this.scheduleService.create({
        weekday: 2,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleWednesdayLucia = await this.scheduleService.create({
        weekday: 3,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleThursdayLucia = await this.scheduleService.create({
        weekday: 4,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });
      const scheduleFridayLucia = await this.scheduleService.create({
        weekday: 5,
        startTime: '09:30:00',
        endTime: '19:30:00',
      });

      // Create staff
      const yulierStaff = await this.staffService.create({
        name: 'Yulier',
        lastName: 'Rondon',
        isActive: true,
        services: [],
        schedules: [
          scheduleMondayYulier.id,
          scheduleTuesdayYulier.id,
          scheduleWednesdayYulier.id,
          scheduleThursdayYulier.id,
          scheduleFridayYulier.id,
        ],
      });
      const luciaStaff = await this.staffService.create({
        name: 'Lucia',
        lastName: 'Ascencio',
        isActive: true,
        services: [],
        schedules: [
          scheduleMondayLucia.id,
          scheduleTuesdayLucia.id,
          scheduleWednesdayLucia.id,
          scheduleThursdayLucia.id,
          scheduleFridayLucia.id,
        ],
      });

      // Create services
      const inPerson = await this.servicesService.create(
        {
          name: 'In-person Tax Filing (Walk-in)',
          isAvailableOnline: false,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_5fb808f66e4b41038b49b058c95190c2~mv2.png',
          ],
          staff: [yulierStaff.id, luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const personalIncome = await this.servicesService.create(
        {
          name: 'Personal Income Tax',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/21276e9bb2a04809a76f2a7bfe161219.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/21276e9bb2a04809a76f2a7bfe161219.jpg',
          ],
          staff: [yulierStaff.id, luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const corporateTaxes = await this.servicesService.create(
        {
          name: 'Corporate Taxes',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_c9f84384d13c494299acf45125117e96~mv2.jpg',
          ],
          staff: [yulierStaff.id, luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const selfEmployed = await this.servicesService.create(
        {
          name: 'Self-Employed & Small Business Tax',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_0aea4a48bc864e5ab04c1d94b1a145fb~mv2.png',
          ],
          staff: [yulierStaff.id, luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const gstHstORWSIBReport = await this.servicesService.create(
        {
          name: 'GST/HST or WSIB Report',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg/v1/fill/w_239,h_154,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_e73f109535a947268a55a563aa3b0e2c~mv2.jpg',
          ],
          staff: [luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const businessRegistration = await this.servicesService.create(
        {
          name: 'Business Registration',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/11062b_f91c262d508e47da8314867ab2d623f4~mv2.jpg',
          ],
          staff: [luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const rentalIncome = await this.servicesService.create(
        {
          name: 'Rental Income Taxes',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_69ebf2d97fbc4330a8f37ec181f07a88~mv2.jpg',
          ],
          staff: [yulierStaff.id, luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const socialInsurance = await this.servicesService.create(
        {
          name: 'Social insurance number for non-resident',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,lg_1,q_80,enc_auto/aa0f39_bc524b4aad49445aaadc48d1a7d8ea33~mv2.jpg',
          ],
          staff: [yulierStaff.id, luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const childBenefit = await this.servicesService.create(
        {
          name: 'Canada Child Benefit Application',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_7e98e260c35f4223bb0f9e2bef147b59~mv2.jpg',
          ],
          staff: [luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const canadaPension = await this.servicesService.create(
        {
          name: 'Canada Pension Plan(CPP) Application',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg/v1/fill/w_266,h_172,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/aa0f39_1b6aa90b46a54c21800559f2b0a04030~mv2.jpg',
          ],
          staff: [luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );
      const oldAgeSecurityApplication = await this.servicesService.create(
        {
          name: 'Old Age Security Application',
          isAvailableOnline: true,
          isActive: true,
          duration: 60,
          images: [
            'https://static.wixstatic.com/media/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png/v1/fill/w_266,h_172,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/aa0f39_41fd90ee5d43439387b7fda342727dde~mv2.png',
          ],
          staff: [luciaStaff.id],
          price: 0,
          address: '1219 St Clair Ave W suite 15, Toronto, ON, Canada',
        },
        alcidesUser,
      );

      // Create posts
      const post = await this.postsService.create(
        {
          title:
            'How Can You Take Advantage of Unclaimed Deductions for Remote Work Expenses?',
          url: 'https://www.ascenciotax.com/post/how-can-you-take-advantage-of-unclaimed-deductions-for-remote-work-expenses',
        },
        yulierUser,
      );

      // Create main default categories
      const expenses = await this.categoriesService.create(
        {
          name: 'Expenses',
          isSystem: true,
          description: 'Category for expenses',
        },
        yulierUser,
      );
      const motorVehicleExpensesBusiness = await this.categoriesService.create(
        {
          name: 'Motor Vehicle Expenses (Business)',
          isSystem: true,
          description: 'Category for expenses related to motor vehicles',
        },
        yulierUser,
      );
      const businessUseOfHomeUtilities = await this.categoriesService.create(
        {
          name: 'Business-use-of- home (Utilities)',
          isSystem: true,
          description: 'Category for expenses related to business-use-of-home',
        },
        yulierUser,
      );
      const medicalExpenses = await this.categoriesService.create(
        {
          name: 'Medical Expenses',
          isSystem: true,
          description: 'Category for medical expenses',
        },
        yulierUser,
      );
      const rent = await this.categoriesService.create(
        {
          name: 'Rent',
          isSystem: true,
          description: 'Category for rent',
        },
        yulierUser,
      );
      // Create default subcategories
      const AdvertisingPromotion = await this.subcategoryService.create(
        {
          name: 'Advertising/ Promotion',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const MealsEntertainment = await this.subcategoryService.create(
        {
          name: 'Meals/ Entertainment',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const SuppliesOfficeExpenseOfficeStationery =
        await this.subcategoryService.create(
          {
            name: 'Supplies/ Office Expense/ Office Stationery',
            isSystem: true,
            categoryId: expenses.id,
          },
          yulierUser,
        );
      const OfficeRental = await this.subcategoryService.create(
        {
          name: 'Office Rental',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const OfficeUtilities = await this.subcategoryService.create(
        {
          name: 'Office Utilities',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const OfficePhone = await this.subcategoryService.create(
        {
          name: 'Office Phone',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const OfficeInternet = await this.subcategoryService.create(
        {
          name: 'Office Internet',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const OfficeMaintenanceRepairs = await this.subcategoryService.create(
        {
          name: 'Office maintenance/ Repairs ',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const StorageRent = await this.subcategoryService.create(
        {
          name: 'Storage Rent',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const Uniform = await this.subcategoryService.create(
        {
          name: 'Uniform',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const RentalEquipmentCarRental = await this.subcategoryService.create(
        {
          name: 'Rental Equipment/ Car Rental',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      const AccountingLegalOtherProfessionalFees =
        await this.subcategoryService.create(
          {
            name: 'Accounting/ Legal/ Other professional Fees',
            isSystem: true,
            categoryId: expenses.id,
          },
          yulierUser,
        );
      const MembershipsSubscriptions = await this.subcategoryService.create(
        {
          name: 'Memberships/ Subscriptions',
          isSystem: true,
          categoryId: expenses.id,
        },
        yulierUser,
      );
      // Subcategories for motor vehicles expenses
      await this.subcategoryService.create(
        {
          name: 'Gasoline',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: '407 Ert',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Parking',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Parking Fines',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Repair/ Maintenance Car',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'License/ Registration',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Car Wash',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Lease Payments ',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Purchase/ Financing',
          isSystem: true,
          categoryId: motorVehicleExpensesBusiness.id,
        },
        yulierUser,
      );
      // Subcategories for Business-use-of- home (Utilities)
      await this.subcategoryService.create(
        {
          name: 'Rental Water Heater',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Gas Natural',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Hydro/ Electricity',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Water',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Maintenance & Repairs',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Interest Mortgage',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Property Tax Bill',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );
      await this.subcategoryService.create(
        {
          name: 'Home Insurance',
          isSystem: true,
          categoryId: businessUseOfHomeUtilities.id,
        },
        yulierUser,
      );

      // Create currencies
      const currencyCanadianDollar = await this.currencyService.create({
        name: 'Canadian dollar',
        coinSuffix: 'CAD',
        symbol: '$',
      });

      const accountTypeCash = await this.accountTypeService.create({
        name: 'Cash',
        description: 'Cash account',
      });

      const account = await this.accountService.create(
        {
          accountTypeId: accountTypeCash.id,
          currencyId: currencyCanadianDollar.id,
          name: 'Cash',
          description: 'Cash account',
          icon: 'cash',
        },
        alcidesUser,
      );

      return {
        message: 'Seed Executed',
        status: 'ok',
      };
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  private async deleteData() {
    await this.postsService.removeAll();
    await this.appointmentService.removeAll();
    await this.staffService.removeAll();
    await this.servicesService.removeAll();
    await this.usersService.removeAll();
  }
}
