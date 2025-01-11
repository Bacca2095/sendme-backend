import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ContactDto, CustomValueDto } from './contact.dto';

export class CreateCustomValueDto extends OmitType(CustomValueDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'value',
  'contactId',
]) {
  @ApiProperty()
  @IsString()
  value: string;
}

export class CreateContactDto extends OmitType(ContactDto, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'customValue',
]) {
  @ApiPropertyOptional({ type: [CreateCustomValueDto] })
  @Type(() => CreateCustomValueDto)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  customValue?: CreateCustomValueDto[];
}
