import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { CustomValueDto } from './contact.dto';
import { CreateContactDto } from './create-contact.dto';

export class UpdateCustomValueDto extends PartialType(
  OmitType(CustomValueDto, ['createdAt', 'updatedAt', 'deletedAt']),
) {}

export class UpdateContactDto extends PartialType(
  OmitType(CreateContactDto, ['customValue']),
) {
  @ApiPropertyOptional({ type: [UpdateCustomValueDto] })
  @Type(() => UpdateCustomValueDto)
  @ValidateNested({ each: true })
  @IsArray({ each: true })
  @IsOptional()
  customValue?: UpdateCustomValueDto[];
}
