import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateCustomFieldDto } from './create-custom-field.dto';

export class UpdateCustomFieldDto extends PartialType(
  OmitType(CreateCustomFieldDto, ['organizationId']),
) {}
