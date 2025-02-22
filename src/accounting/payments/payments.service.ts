import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';
import { CreatePaymentSheetDto } from './dto/create-payment-sheet.dto ';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
    appInfo: {
      name: 'Accounting app for Ascencio Tax Inc.',
    },
  });

  async createPaymentSheet(createPaymentSheetDto: CreatePaymentSheetDto) {
    const { amount, currency } = createPaymentSheetDto;
    try {
      const customer = await this.stripe.customers.create();
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2025-01-27.acacia' },
      );
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        // currency: 'cad',
        customer: customer.id,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error creating payment intent');
    }
  }

  // create(createPaymentDto: CreatePaymentDto) {
  //   return 'This action adds a new payment';
  // }

  // findAll() {
  //   return `This action returns all payments`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} payment`;
  // }

  // update(id: number, updatePaymentDto: UpdatePaymentDto) {
  //   return `This action updates a #${id} payment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} payment`;
  // }
}
