import { ApiProperty } from '@nestjs/swagger';
import { $Enums, CustomField } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

export class CustomFieldDto implements CustomField {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  fieldName: string;

  @ApiProperty({
    enum: $Enums.ElementType,
  })
  @IsEnum($Enums.ElementType)
  elementType: $Enums.ElementType;

  @ApiProperty({
    enum: $Enums.DataType,
  })
  @IsEnum($Enums.DataType)
  dataType: $Enums.DataType;

  @ApiProperty()
  options: JsonValue;

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
