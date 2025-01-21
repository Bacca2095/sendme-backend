import { OmitType } from '@nestjs/swagger';

import { PaymentProviderDto } from './payment-provider.dto';

export class CreatePaymentProviderDto extends OmitType(PaymentProviderDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}
