import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { Job } from 'bullmq';

import { MessageProviderDto } from '@/message-providers/dto/message-provider.dto';
import { CountryCodeMap } from '@/shared/constants/country-code-map';
import { PrismaService } from '@/shared/providers/prisma.service';

import { ProviderFactoryService } from '../providers/provider-factory.service';

@Processor('message-queue')
export class MessageQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageQueueProcessor.name);

  constructor(
    private readonly db: PrismaService,
    private readonly providerFactoryService: ProviderFactoryService,
  ) {
    super();
  }

  async process(
    job: Job<{ sentMessages: any[]; channel: string }>,
    _token?: string,
  ): Promise<void> {
    const { sentMessages, channel } = job.data;

    this.logger.log(
      `Processing ${sentMessages.length} messages for channel: ${channel}`,
    );

    await this.db.$transaction(async (prisma) => {
      const organizationId = sentMessages[0].organizationId;

      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new Error(`Organization with ID ${organizationId} not found.`);
      }

      sentMessages.forEach((message) => {
        if (!message.country) {
          this.logger.warn(
            `Message ${message.id} does not have a country. Using organization's default country: ${organization.country}`,
          );
          message.country = CountryCodeMap[organization.country];
        }
      });

      const subscription = await prisma.subscription.findFirst({
        where: { organizationId, status: 'active' },
        include: { plan: true },
      });

      if (!subscription || !subscription.plan) {
        throw new Error(
          `No active subscription or plan found for organization ${organizationId}.`,
        );
      }

      const messageCost = subscription.plan.pricePerMessage;

      const recargas = await prisma.recharge.findMany({
        where: {
          organizationId,
          remainingAmount: { gt: 0 },
          status: 'accepted',
        },
        orderBy: { remainingAmount: 'asc' },
      });

      let remainingCost = messageCost * sentMessages.length;
      let rechargeIndex = 0;

      for (const message of sentMessages) {
        let costForMessage = messageCost;

        while (rechargeIndex < recargas.length && costForMessage > 0) {
          const recarga = recargas[rechargeIndex];
          const deductAmount = Math.min(
            costForMessage,
            recarga.remainingAmount,
          );

          await prisma.recharge.update({
            where: { id: recarga.id },
            data: {
              remainingAmount: { decrement: deductAmount },
              remainingMessages: { decrement: 1 },
            },
          });

          costForMessage -= deductAmount;
          remainingCost -= deductAmount;

          if (recarga.remainingAmount <= deductAmount) {
            rechargeIndex++;
          }

          await prisma.sentMessage.update({
            where: { id: +message.id },
            data: { rechargeId: recarga.id },
          });
        }

        if (costForMessage > 0) {
          if (
            subscription.messageUsage + Math.ceil(costForMessage / messageCost)
          ) {
            this.logger.error(
              'Not enough subscription balance to send the message.',
            );
            throw new Error(
              'Insufficient subscription balance to send the message.',
            );
          }

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              messageUsage: {
                increment: Math.ceil(costForMessage / messageCost),
              },
            },
          });

          this.logger.log(
            `Message ${message.id} cost deducted from subscription balance.`,
          );
          remainingCost -= costForMessage;
        }
      }

      if (remainingCost > 0) {
        this.logger.warn(
          `Remaining cost could not be deducted: ${remainingCost}`,
        );
      }

      const channelProviders = await prisma.channelProvider.findMany({
        where: { channel: { name: channel } },
        include: { provider: true },
        orderBy: { priority: 'asc' },
      });

      const providers = channelProviders.map((cp) => cp.provider);

      for (const provider of providers) {
        const adapter = this.providerFactoryService.getAdapter(provider.name);

        const { sentMessages: successfulMessages, failedMessages } =
          await adapter.sendBatchMessages(
            sentMessages,
            provider.config as unknown as MessageProviderDto,
          );

        for (const sentMessage of successfulMessages) {
          await prisma.sentMessage.update({
            where: { id: sentMessage.id },
            data: {
              status: sentMessage.status as $Enums.MessageStatus,
              deliveryStatus: sentMessage.deliveryStatus,
              providerRawResponse: sentMessage.providerRawResponse,
              providerId: provider.id,
              sentAt: new Date(),
            },
          });

          this.logger.log(
            `Message ${sentMessage.id} sent successfully via ${provider.name}.`,
          );
        }

        if (failedMessages.length > 0) {
          this.logger.warn(
            `Retrying ${failedMessages.length} failed messages with the next provider.`,
          );
          sentMessages.length = 0;
          sentMessages.push(...failedMessages);
          continue;
        }

        sentMessages.length = 0;
        break;
      }

      if (sentMessages.length > 0) {
        this.logger.error(`All providers failed for the remaining messages.`);
        throw new Error(
          `Failed to send the following messages: ${sentMessages.map(
            (m) => m.id,
          )}`,
        );
      }
    });

    this.logger.log(
      `All messages processed successfully for channel: ${channel}.`,
    );
  }
}
