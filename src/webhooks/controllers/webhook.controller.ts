import { Body, Controller, Param, Post, Req } from '@nestjs/common';

import { PaymentWebhookService } from '../providers/payment-webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly paymentWebhookService: PaymentWebhookService) {}

  @Post('payment/:providerName')
  handleWebhook(
    @Param('providerName') providerName: string,
    @Body() body: Record<string, any>,
    @Req() request: Request,
  ) {
    return this.paymentWebhookService.processWebhook(
      providerName,
      body,
      request.headers,
    );
  }
}
