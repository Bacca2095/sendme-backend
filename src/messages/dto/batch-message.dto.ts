import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BatchMessageDto {
  @ApiProperty({
    description: 'Canal por el cual se enviarán los mensajes',
    example: 'sms',
  })
  @IsNotEmpty()
  @IsString()
  channel: string;

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
  recipients: string[];

  @ApiProperty({
    description: 'Contenido del mensaje a enviar',
    example: 'This is a batch message.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;
}
