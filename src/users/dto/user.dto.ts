import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { RoleDto } from '@/roles/dto/role.dto';

export class UserWithPasswordDto implements User {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  organizationId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: RoleDto })
  @ValidateNested()
  @Type(() => RoleDto)
  role: RoleDto;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiPropertyOptional()
  @IsDateString()
  deletedAt: Date;
}

export class UserDto extends OmitType(UserWithPasswordDto, ['password']) {}
