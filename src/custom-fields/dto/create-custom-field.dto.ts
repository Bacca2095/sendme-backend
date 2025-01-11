import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsArray, IsString, ValidateIf } from 'class-validator';

import { CustomFieldDto } from './custom-field.dto';

export class CreateCustomFieldDto extends OmitType(CustomFieldDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'options',
]) {
  @ApiPropertyOptional()
  @ValidateIf((o) => o.elementType === 'select')
  @IsString({ each: true })
  @IsArray()
  options?: string[];
}
