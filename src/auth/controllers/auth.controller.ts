import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { SignInDto } from '@/auth/dto/sign-in.dto';
import { TokenResponseDto } from '@/auth/dto/token-response.dto';
import { AuthService } from '@/auth/providers/auth.service';

import { SignUpDto } from '../dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiCreatedResponse({ type: TokenResponseDto })
  async signIn(@Body() dto: SignInDto): Promise<TokenResponseDto> {
    const { email, password } = dto;
    return this.authService.signIn(email, password);
  }

  @Post('sign-up')
  @ApiCreatedResponse({ type: TokenResponseDto })
  async signUp(@Body() dto: SignUpDto): Promise<TokenResponseDto> {
    return this.authService.signUp(dto);
  }
}
