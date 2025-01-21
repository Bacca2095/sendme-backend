import { Module } from '@nestjs/common';

import { WebhookController } from './controllers/webhook.controller';
import { PaymentWebhookService } from './providers/payment-webhook.service';

@Module({
  controllers: [WebhookController],
  providers: [PaymentWebhookService],
})
export class WebhookModule {}
