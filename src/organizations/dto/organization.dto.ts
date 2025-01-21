import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class OrganizationDto implements Organization {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  domain: string;

  @ApiProperty()
  @IsString()
  document: string;

  @ApiProperty()
  @IsString()
  documentType: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  apiKey: string;

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
