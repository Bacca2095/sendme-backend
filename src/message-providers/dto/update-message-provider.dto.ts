import { PartialType } from '@nestjs/swagger';

import { CreateMessageProviderDto } from './create-message-provider.dto';

export class UpdateMessageProviderDto extends PartialType(
  CreateMessageProviderDto,
) {}
