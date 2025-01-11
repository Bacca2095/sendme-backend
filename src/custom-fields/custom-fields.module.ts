import { Module } from '@nestjs/common';

import { CustomFieldsController } from './controllers/custom-fields.controller';
import { CustomFieldsService } from './providers/custom-fields.service';

@Module({
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService],
})
export class CustomFieldsModule {}
