import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService, type User, type TokenPair } from '@repo/auth-core';
import { BetterAuthServiceImpl } from '@repo/auth-better-auth';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { SignUpRequestDto } from './dto/sign-up.dto';
import { SignInRequestDto } from './dto/sign-in.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password.dto';
import { ResetPasswordRequestDto } from './dto/reset-password.dto';
import { ChangePasswordRequestDto } from './dto/change-password.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token.dto';
import { AuthResultResponseDto, TokenPairDto } from './dto/auth-result.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResultResponseDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async signUp(@Body() dto: SignUpRequestDto): Promise<AuthResultResponseDto> {
    const result = await this.authService.signUp(dto);

    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }

    return { user: result.user, tokens: result.tokens };
  }

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResultResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() dto: SignInRequestDto): Promise<AuthResultResponseDto> {
    const result = await this.authService.signIn(dto);

    if (!result.success) {
      throw new UnauthorizedException(result.error.message);
    }

    return { user: result.user, tokens: result.tokens };
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out current session' })
  @ApiResponse({ status: 204, description: 'Signed out successfully' })
  async signOut(
    @Headers('authorization') authorization: string,
  ): Promise<void> {
    const token = authorization.replace('Bearer ', '');
    const session = await this.authService.verifySession(token);
    if (session) {
      await this.authService.signOut(session.id);
    }
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent (if account exists)' })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(dto.email);
    return { message: 'If an account with that email exists, a reset link has been sent' };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successful', type: AuthResultResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<AuthResultResponseDto> {
    const result = await this.authService.resetPassword(dto);

    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }

    return { user: result.user, tokens: result.tokens };
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password incorrect' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Password changed successfully' };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: TokenPairDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<TokenPair> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address using token from email link' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    if (!token) throw new BadRequestException('Verification token is required');

    const impl = this.authService as BetterAuthServiceImpl;
    const result = await impl.verifyEmail(token);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return { message: result.message };
  }

  @Post('resend-verification')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    const impl = this.authService as BetterAuthServiceImpl;
    await impl.resendVerificationEmail(user.id);
    return { message: 'Verification email sent' };
  }
}
