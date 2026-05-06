import { ApiProperty } from '@nestjs/swagger';

export class TokenPairDto {
  @ApiProperty({ description: 'JWT access token' })
  readonly accessToken!: string;

  @ApiProperty({ description: 'Refresh token' })
  readonly refreshToken!: string;

  @ApiProperty({ example: 3600, description: 'Token expiry in seconds' })
  readonly expiresIn!: number;
}

export class UserResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  readonly id!: string;

  @ApiProperty({ example: 'john@example.com' })
  readonly email!: string;

  @ApiProperty({ example: 'John Doe' })
  readonly name!: string;

  @ApiProperty({ example: '+1234567890', nullable: true })
  readonly phone!: string | null;

  @ApiProperty({ example: 'user', enum: ['user', 'admin', 'super_admin'] })
  readonly role!: string;

  @ApiProperty({ example: true })
  readonly emailVerified!: boolean;

  @ApiProperty({ example: false })
  readonly twoFactorEnabled!: boolean;
}

export class AuthResultResponseDto {
  @ApiProperty({ type: UserResponseDto })
  readonly user!: UserResponseDto;

  @ApiProperty({ type: TokenPairDto })
  readonly tokens!: TokenPairDto;
}
