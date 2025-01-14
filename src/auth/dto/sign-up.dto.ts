import { OmitType } from '@nestjs/swagger';

import { CreateUserDto } from '@/users/dto/create-user.dto';

export class SignUpDto extends OmitType(CreateUserDto, [
  'roleId',
  'organizationId',
]) {}
