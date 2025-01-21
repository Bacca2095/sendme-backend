import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { $Enums, SentMessage } from '@prisma/client';

import { MessageProviderConfigDto } from '@/message-providers/dto/config-message-provider.dto';
import { PrismaService } from '@/shared/providers/prisma.service';

import { MessageTransformService } from './message-transform.service';
import { BatchMessageDto } from '../dto/batch-message.dto';
import { SentMessageOutput } from '../interfaces/send-message-output.interface';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly messageProviderService: MessageTransformService,
  ) {}

  private async validateApiKeyAndGetOrganizationId(
    apiKey: string,
  ): Promise<number> {
    const organization = await this.db.organization.findFirst({
      where: { apiKey },
    });

    if (!organization) {
      this.logger.error(`Invalid API key: ${apiKey}`);
      throw new UnauthorizedException('Invalid API key');
    }

    return organization.id;
  }

  private async getProvidersByChannel(
    channelName: string,
  ): Promise<(MessageProviderConfigDto & { id: number })[]> {
    const providers = await this.db.provider.findMany({
      where: {
        channelProviders: {
          some: {
            channel: {
              name: channelName,
            },
          },
        },
      },
      include: {
        channelProviders: {
          orderBy: {
            priority: 'asc',
          },
        },
      },
    });

    return providers
      .map((provider) => ({
        ...provider,
        config: provider.config as unknown as MessageProviderConfigDto,
        priority: provider.channelProviders[0].priority,
        id: provider.id,
      }))
      .sort((a, b) => (a.priority || Infinity) - (b.priority || Infinity))
      .map((provider) => ({ ...provider.config, id: provider.id }));
  }

  async sendMessages(
    apiKey: string,
    data: BatchMessageDto,
  ): Promise<SentMessage[] | SentMessageOutput[]> {
    const { recipients, content, channel, country } = data;

    this.logger.log(`Processing messages for channel: ${channel}`);

    // Validar y obtener la organización
    const organizationId =
      await this.validateApiKeyAndGetOrganizationId(apiKey);

    // Obtener el plan activo y el precio por mensaje
    const subscription = await this.db.subscription.findFirst({
      where: {
        organizationId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription || !subscription.plan) {
      throw new Error(
        'No active subscription or plan found for the organization.',
      );
    }

    const messageCost = subscription.plan.pricePerMessage;

    // Obtener recargas disponibles
    const recargas = await this.db.recharge.findMany({
      where: {
        organizationId,
        remainingAmount: { gt: 0 },
        status: 'accepted',
      },
      orderBy: { remainingAmount: 'asc' },
    });

    // Crear mensajes en la base de datos
    const sentMessages = await Promise.all(
      recipients.map(async (recipient) => {
        const contact = await this.db.contact.findFirst({
          where: {
            organizationId,
            OR: [{ phone: recipient }, { email: recipient }],
          },
        });

        const message = await this.db.sentMessage.create({
          data: {
            organizationId,
            content,
            contentType: 'plain_text',
            recipientDetails: recipient,
            status: 'queued',
            deliveryStatus: 'pending',
            contactId: contact?.id || null,
          },
        });

        return {
          id: message.id.toString(),
          recipient,
          content,
          country,
          dbMessage: message,
        };
      }),
    );

    // Manejar costos de mensajes
    let remainingCost = messageCost * recipients.length; // Costo total para todos los mensajes
    let rechargeIndex = 0;

    for (const { dbMessage } of sentMessages) {
      let costForMessage = messageCost;

      // Descontar de recargas
      while (rechargeIndex < recargas.length && costForMessage > 0) {
        const recarga = recargas[rechargeIndex];
        const deductAmount = Math.min(costForMessage, recarga.remainingAmount);

        await this.db.recharge.update({
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

        // Asociar recarga al mensaje
        await this.db.sentMessage.update({
          where: { id: dbMessage.id },
          data: { rechargeId: recarga.id },
        });
      }

      // Si no hay recargas suficientes, usar saldo de la suscripción
      if (costForMessage > 0) {
        if (
          subscription.messageUsage + Math.ceil(costForMessage / messageCost) >
          subscription.plan.messageLimit
        ) {
          this.logger.error(
            'Not enough subscription balance to send the message.',
          );
          throw new Error(
            'Insufficient subscription balance to send the message.',
          );
        }

        await this.db.subscription.update({
          where: { id: subscription.id },
          data: {
            messageUsage: {
              increment: Math.ceil(costForMessage / messageCost),
            },
          },
        });

        this.logger.log(
          `Message ${dbMessage.id} cost deducted from subscription balance.`,
        );
        remainingCost -= costForMessage;
      }
    }

    if (remainingCost > 0) {
      this.logger.warn(
        `Remaining cost could not be deducted: ${remainingCost}`,
      );
    }

    // Obtener los proveedores
    const providers = await this.getProvidersByChannel(channel);

    for (const provider of providers) {
      try {
        const isBatch = recipients.length > 1;
        const messagesToSend = sentMessages.map(
          ({ id, recipient, content, country }) => ({
            id,
            recipient,
            content,
            country,
          }),
        );

        const response = isBatch
          ? await this.messageProviderService.handleBatch(
              provider,
              messagesToSend,
            )
          : [
              await this.messageProviderService.handleSingle(
                provider,
                messagesToSend[0],
              ),
            ];

        await Promise.all(
          response.map((result) => {
            return this.db.sentMessage.update({
              where: { id: Number(result.id) },
              data: {
                status: result.status as $Enums.MessageStatus,
                deliveryStatus: result.deliveryStatus,
                providerRawResponse: result.providerRawResponse,
                providerId: provider.id,
              },
            });
          }),
        );

        this.logger.log(
          `${isBatch ? 'Batch' : 'Single'} messages sent successfully via provider.`,
        );
        return response;
      } catch (error) {
        this.logger.warn(
          `Provider ${provider} failed. Trying next provider. Error: ${error['message']}`,
        );
      }
    }

    this.logger.error('All providers failed for messages.');
    throw new Error('All providers failed for messages.');
  }
}
