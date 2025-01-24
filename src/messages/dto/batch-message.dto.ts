import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BatchMessageDto {
  @ApiProperty({
    description:
      'Lista de destinatarios. Puede contener números de teléfono o correos electrónicos según el canal',
    examples: [
      ['+1234567890', '+9876543210'],
      ['example1@example.com', 'example2@example.com'],
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  contacts: string[];

  @ApiProperty({
    description: 'Contenido del mensaje a enviar',
    example: 'This is a batch message.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  country?: string;
}
