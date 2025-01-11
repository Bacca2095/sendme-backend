import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDto } from '../dto/user.dto';
import { UserService } from '../providers/user.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({ type: UserDto, isArray: true })
  async get(): Promise<UserDto[]> {
    return this.userService.get();
  }

  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  async getById(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.userService.getById(id);
  }

  @Post()
  @ApiOkResponse({ type: UserDto })
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.userService.remove(id);
  }
}
