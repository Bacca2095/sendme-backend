import { OmitType } from '@nestjs/swagger';

import { SubscriptionDto } from './subscription.dto';

export class CreateSubscriptionDto extends OmitType(SubscriptionDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}
