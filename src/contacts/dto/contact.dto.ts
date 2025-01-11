import { ApiProperty } from '@nestjs/swagger';
import { Contact, CustomValue } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CustomValueDto implements CustomValue {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  value: JsonValue;

  @ApiProperty()
  @IsNumber()
  contactId: number;

  @ApiProperty()
  @IsNumber()
  customFieldId: number;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @IsDateString()
  deletedAt: Date;
}

export class ContactDto implements Contact {
  @ApiProperty()
  @IsString()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsPhoneNumber('CO')
  phone: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty({ type: [CustomValueDto] })
  @Type(() => CustomValueDto)
  @ValidateNested({ each: true })
  @IsArray({ each: true })
  customValue: CustomValueDto[];

  @ApiProperty()
  @IsNumber()
  organizationId: number;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @IsDateString()
  deletedAt: Date;
}
