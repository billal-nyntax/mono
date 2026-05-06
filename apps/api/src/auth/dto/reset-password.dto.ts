import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ResetPasswordRequestDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  readonly token!: string;

  @ApiProperty({
    example: 'NewStr0ng@Pass',
    minLength: 8,
    description: 'New password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  })
  readonly password!: string;

  @ApiProperty({ example: 'NewStr0ng@Pass', description: 'Must match password' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  readonly confirmPassword!: string;
}
