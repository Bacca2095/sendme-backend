import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckMessageStatusDto {
  @ApiProperty({
    description: 'ID de la transacción del mensaje para consultar su estado',
    example: 'txn_123456789',
  })
  @IsNotEmpty()
  @IsString()
  transactionId: string;
}
