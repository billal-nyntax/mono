import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty({ description: 'Refresh token to exchange for new access token' })
  @IsString()
  readonly refreshToken!: string;
}
