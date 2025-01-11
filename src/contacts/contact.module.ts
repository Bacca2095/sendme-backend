import { Module } from '@nestjs/common';

import { ContactController } from './controllers/contact.controller';
import { ContactService } from './providers/contact.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
