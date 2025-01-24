import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, Contact, CustomValue } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
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

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deletedAt: Date;
}

export class ContactDto implements Contact {
  @ApiProperty()
  @IsNumber()
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

  @ApiProperty({
    enum: $Enums.ContactStatus,
  })
  @IsEnum($Enums.ContactStatus)
  status: $Enums.ContactStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  birthDate: Date;

  @ApiProperty({ type: () => [CustomValueDto] })
  @Type(() => CustomValueDto)
  @ValidateNested({ each: true })
  @IsArray()
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

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deletedAt: Date;
}
