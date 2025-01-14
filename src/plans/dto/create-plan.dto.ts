import { OmitType } from '@nestjs/swagger';

import { PlanDto } from './plan.dto';

export class CreatePlanDto extends OmitType(PlanDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {}
