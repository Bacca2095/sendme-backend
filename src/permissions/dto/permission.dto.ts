import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class PermissionDto implements Permission {
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
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;
}
