import { ApiProperty } from '@nestjs/swagger';
import { Plan } from '@prisma/client';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class PlanDto implements Plan {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  contactLimit: number;

  @ApiProperty()
  @IsNumber()
  campaignLimit: number;

  @ApiProperty()
  @IsNumber()
  cost: number;

  @ApiProperty()
  @IsNumber()
  pricePerMessage: number;

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
