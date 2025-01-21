import { Module } from '@nestjs/common';

import { PaymentProviderController } from './controllers/payment-provider.controller';
import { PaymentProviderService } from './providers/payment-provider.service';

@Module({
  controllers: [PaymentProviderController],
  providers: [PaymentProviderService],
})
export class PaymentProviderModule {}
