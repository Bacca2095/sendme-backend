import { ApiProperty, OmitType } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';

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

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ enum: $Enums.UserRole })
  @IsEnum($Enums.UserRole)
  role: $Enums.UserRole;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  deletedAt: Date;
}

export class UserDto extends OmitType(UserWithPasswordDto, ['password']) {}
