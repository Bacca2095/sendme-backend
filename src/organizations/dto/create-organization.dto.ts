import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

import { OrganizationDto } from './organization.dto';

export class CreateOrganizationDto extends PartialType(
  OmitType(OrganizationDto, ['id', 'createdAt', 'deletedAt', 'updatedAt']),
) {
  @ApiPropertyOptional()
  domain?: string;

  name: string;
}
