import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Canal por el cual se enviará el mensaje',
    example: 'sms',
  })
  @IsNotEmpty()
  @IsString()
  channel: string;

  @ApiProperty({
    description:
      'Destinatario del mensaje. Puede ser un número de teléfono o un correo electrónico dependiendo del canal',
    example: '+1234567890 (para SMS) o example@example.com (para EMAIL)',
  })
  @IsNotEmpty()
  @IsString()
  recipient: string;

  @ApiProperty({
    description: 'Contenido del mensaje a enviar',
    example: 'Hello, this is a test message.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;
}
