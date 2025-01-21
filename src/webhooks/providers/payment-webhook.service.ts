import * as crypto from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { RRule } from 'rrule';

import { AppErrorCodesEnum } from '@/exceptions/enums/app-error-codes.enum';
import { AppError } from '@/exceptions/errors/app.error';
import { PrismaService } from '@/shared/providers/prisma.service';

export interface WebhookFieldMappings {
  typeOfTransaction: string | null | undefined;
  organizationId: number | null | undefined;
  planId: number | null | undefined;
  amount: number | null | undefined;
  method: string | null | undefined;
  transactionId: string | null | undefined;
  status: $Enums.RechargeStatus | null | undefined;
  notes: string | null | undefined;
  documentType: string | null | undefined;
  document: string | null | undefined;
  country: string | null | undefined;
  city: string | null | undefined;
  address: string | null | undefined;
  phone: string | null | undefined;
  name: string | null | undefined;
  email: string | null | undefined;
  currencyCode: string | null | undefined;
}

export enum PaymentWebhookTypeOfTransaction {
  RECHARGE = 'recharge',
  ENROLLMENT = 'enrollment',
  SUBSCRIPTION = 'subscription',
}

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(private readonly db: PrismaService) {}

  private validateSignature(
    payload: Record<string, any>,
    receivedSignature: string,
    hashConfig: { type: string; stringTemplate: string },
    credentials: Record<string, string>,
  ): boolean {
    const template = hashConfig.stringTemplate;

    const hashString = Object.keys(credentials).reduce(
      (acc, key) => acc.replace(new RegExp(`\\$${key}`, 'g'), credentials[key]),
      template,
    );

    const fullString = Object.keys(payload).reduce(
      (acc, key) =>
        acc.replace(new RegExp(`\\$${key}`, 'g'), payload[key] || ''),
      hashString,
    );

    const computedHash = crypto
      .createHash(hashConfig.type)
      .update(fullString)
      .digest('hex');
    return computedHash === receivedSignature;
  }

  private castToType(value: any, type: string) {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === true;
      case 'date':
        return new Date(value);
      case 'string':
      default:
        return value?.toString() || null;
    }
  }

  async processWebhook(
    providerName: string,
    webhookData: Record<string, any>,
    headers: Headers,
  ) {
    this.logger.log(`Processing webhook for provider: ${providerName}`);
    this.logger.debug(`Webhook data: ${JSON.stringify(webhookData)}`);

    const provider = await this.db.paymentProvider.findUniqueOrThrow({
      where: { name: providerName },
    });

    const config = provider.config as {
      credentials: Record<string, string>;
      propertyMapping: {
        toModel: Record<string, { field: string; type: string }>;
      };
      hashConfig: {
        type: string;
        stringTemplate: string;
      };
      signature: {
        key: string;
        presentIn: string;
      };
      statusMapping: {
        statusKey: string;
        values: Record<string, string>;
      };
    };

    const receivedSignature =
      config.signature.presentIn === 'body'
        ? webhookData[config.signature.key]
        : headers[config.signature.key.toLowerCase()];

    if (!receivedSignature) {
      this.logger.warn('Missing or invalid signature in webhook request.');
      throw new AppError(AppErrorCodesEnum.UNAUTHORIZED);
    }

    const isValid = this.validateSignature(
      webhookData,
      receivedSignature,
      config.hashConfig,
      config.credentials,
    );

    if (!isValid) {
      this.logger.error('Invalid signature for webhook.');
      throw new AppError(AppErrorCodesEnum.UNAUTHORIZED);
    }

    const paymentData: WebhookFieldMappings = Object.keys(
      config.propertyMapping.toModel,
    ).reduce((acc, key) => {
      const mappingDetail = config.propertyMapping.toModel[key];
      acc[mappingDetail.field] = this.castToType(
        webhookData[key],
        mappingDetail.type,
      );
      return acc;
    }, {} as WebhookFieldMappings);

    paymentData.status = this.mapStatus(
      webhookData[config.statusMapping.statusKey],
      config.statusMapping,
    );

    const typeOfTransaction = paymentData.typeOfTransaction;

    if (typeOfTransaction === PaymentWebhookTypeOfTransaction.RECHARGE) {
      await this.createRecharge(paymentData, provider.id);
      this.logger.log('Recharge processed successfully.');
      return { message: 'Recharge processed successfully.' };
    }

    if (typeOfTransaction === PaymentWebhookTypeOfTransaction.ENROLLMENT) {
      await this.createEnrollment(paymentData, provider.id);
      this.logger.log('Enrollment processed successfully.');
      return { message: 'Enrollment processed successfully.' };
    }

    if (typeOfTransaction === PaymentWebhookTypeOfTransaction.SUBSCRIPTION) {
      await this.createOrUpdateSubscription(paymentData, provider.id);
      this.logger.log('Subscription processed successfully.');
      return { message: 'Subscription processed successfully.' };
    }

    this.logger.error('Invalid transaction type received in webhook.');
    throw new AppError(AppErrorCodesEnum.NOT_VALID_OPERATION_FOR_PAYMENT);
  }

  async createRecharge(paymentData: WebhookFieldMappings, providerId: number) {
    await this.db.$transaction(async (tx) => {
      const organization = await tx.organization.findUniqueOrThrow({
        where: { id: paymentData.organizationId },
      });

      const payment = await tx.payment.create({
        data: {
          amount: +paymentData.amount || 0,
          method: paymentData.method || 'unknown',
          transactionId: paymentData.transactionId || 'unknown',
          currencyCode: paymentData.currencyCode || 'USD',
          paymentProvider: { connect: { id: providerId } },
          status: paymentData.status,
          organization: { connect: { id: organization.id } },
        },
      });

      const recharge = await tx.recharge.create({
        data: {
          amount: payment.amount,
          status: payment.status,
          currencyCode: payment.currencyCode,
          organization: { connect: { id: organization.id } },
          payment: { connect: { id: payment.id } },
          messageCount: 0,
          remainingAmount: payment.amount,
          remainingMessages: 0,
        },
      });

      this.logger.log('Recharge created successfully.');
      this.logger.debug(`Recharge details: ${JSON.stringify(recharge)}`);
    });
  }

  async createEnrollment(
    paymentData: WebhookFieldMappings,
    providerId: number,
  ) {
    await this.db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: paymentData.name,
          city: paymentData.city,
          country: paymentData.country,
          address: paymentData.address,
          document: paymentData.document,
          documentType: paymentData.documentType,
          phone: paymentData.phone,
        },
      });

      const user = await tx.user.create({
        data: {
          name: paymentData.name,
          email: paymentData.email,
          password: crypto.randomBytes(16).toString('hex'),
          organization: { connect: { id: organization.id } },
          role: { connect: { name: 'manager' } },
        },
      });

      const payment = await tx.payment.create({
        data: {
          amount: +paymentData.amount || 0,
          method: paymentData.method || 'unknown',
          transactionId: paymentData.transactionId || 'unknown',
          status: paymentData.status,
          currencyCode: paymentData.currencyCode || 'USD',
          paymentProvider: { connect: { id: providerId } },
          organization: { connect: { id: organization.id } },
        },
      });

      this.logger.log('Enrollment created successfully.');
      this.logger.debug(
        `Enrollment details: Organization: ${organization.id}, User: ${user.id}, Payment: ${payment.id}`,
      );
    });
  }

  async createOrUpdateSubscription(
    paymentData: WebhookFieldMappings,
    providerId: number,
  ) {
    const nextResetDate = this.nextResetDate();
    await this.db.$transaction(async (tx) => {
      const organization = await tx.organization.findUniqueOrThrow({
        where: { id: paymentData.organizationId },
      });

      const plan = await tx.plan.findUniqueOrThrow({
        where: { id: paymentData.planId },
      });

      const limits = {
        messageLimit: plan.messageLimit || 0,
        contactLimit: plan.contactLimit || 0,
        campaignLimit: plan.campaignLimit || 0,
      };

      const subscription = await tx.subscription.findFirst({
        where: { organizationId: organization.id },
        include: { plan: true },
      });

      if (subscription?.planId === paymentData.planId) {
        const resetSubscription = await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            nextResetDate,
            endDate: nextResetDate,
            messageUsage: 0,
            contactLimit: limits.contactLimit,
            campaignLimit: limits.campaignLimit,
            status: 'active',
          },
        });

        await tx.payment.create({
          data: {
            amount: +paymentData.amount || 0,
            method: paymentData.method || 'unknown',
            transactionId: paymentData.transactionId || 'unknown',
            status: paymentData.status,
            currencyCode: paymentData.currencyCode || 'USD',
            paymentProvider: { connect: { id: providerId } },
            organization: { connect: { id: organization.id } },
            subscription: { connect: { id: resetSubscription.id } },
          },
        });

        this.logger.log('Subscription reset successfully.');
      } else {
        if (subscription) {
          await tx.subscription.update({
            where: { id: subscription.id },
            data: { status: 'inactive' },
          });
        }

        const newSubscription = await tx.subscription.create({
          data: {
            plan: { connect: { id: paymentData.planId } },
            organization: { connect: { id: organization.id } },
            startDate: new Date(),
            endDate: nextResetDate,
            nextResetDate,
            contactLimit: limits.contactLimit,
            campaignLimit: limits.campaignLimit,
            status: 'active',
          },
        });

        await tx.payment.create({
          data: {
            amount: +paymentData.amount || 0,
            method: paymentData.method || 'unknown',
            transactionId: paymentData.transactionId || 'unknown',
            status: paymentData.status,
            currencyCode: paymentData.currencyCode || 'USD',
            paymentProvider: { connect: { id: providerId } },
            organization: { connect: { id: organization.id } },
            subscription: { connect: { id: newSubscription.id } },
          },
        });

        this.logger.log('Subscription created successfully.');
      }
    });
  }

  private nextResetDate(): Date {
    const now = new Date();
    const nextMonthDate = new RRule({
      freq: RRule.MONTHLY,
      count: 1,
      dtstart: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        0,
        0,
        0,
      ),
    });

    return nextMonthDate.all()[0];
  }

  private mapStatus(
    externalStatus: string,
    statusMapping: { statusKey: string; values: Record<string, string> },
  ): $Enums.RechargeStatus {
    return statusMapping.values[externalStatus] as $Enums.RechargeStatus;
  }
}
