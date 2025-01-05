import { Injectable } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { UsersService } from '../users/users.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { StaffService } from 'src/staff/staff.service';
import { ValidRoles } from 'src/auth/interfaces';
import { AppointmentService } from '../appointment/appointment.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
    private readonly scheduleService: ScheduleService,
    private readonly staffService: StaffService,
    private readonly appointmentService: AppointmentService,
  ) {}

  async runSeed() {
    try {
      await this.deleteData();

      // Ceate users
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
        email: 'yrondon@ascenciotaxinc.com',
        phoneNumber: '+16474669318',
        password: 'Abcd1234',
        birthdate: new Date('1993-01-18'),
        registrationDate: new Date(),
        isActive: true,
        roles: [ValidRoles.staff],
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

      // const appointment1 = await this.appointmentService.create(
      //   {
      //     startDateAndTime: 'Tue Dec 24 2024 08:00:00 GMT-0500',
      //     endDateAndTime: 'Tue Dec 24 2024 09:00:00 GMT-0500',
      //     state: 'pending',
      //     service: inPerson.id,
      //     staff: yulierStaff.id,
      //     comments: '',
      //   },
      //   alcidesUser,
      // );
      // const appointment2 = await this.appointmentService.create(
      //   {
      //     startDateAndTime: 'Tue Dec 24 2024 09:00:00 GMT-0500',
      //     endDateAndTime: 'Tue Dec 24 2024 09:30:00 GMT-0500',
      //     state: 'pending',
      //     service: oldAgeSecurityApplication.id,
      //     staff: yulierStaff.id,
      //     comments: '',
      //   },
      //   alcidesUser,
      // );
      // const appointment3 = await this.appointmentService.create(
      //   {
      //     startDateAndTime: 'Tue Dec 24 2024 09:30:00 GMT-0500',
      //     endDateAndTime: 'Tue Dec 24 2024 11:00:00 GMT-0500',
      //     state: 'pending',
      //     service: oldAgeSecurityApplication.id,
      //     staff: luciaStaff.id,
      //     comments: '',
      //   },
      //   alcidesUser,
      // );

      return {
        message: 'Seed Executed',
        status: 'ok',
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  private async deleteData() {
    await this.appointmentService.removeAll();
    await this.staffService.removeAll();
    await this.servicesService.removeAll();
    await this.usersService.removeAll();
  }
}
