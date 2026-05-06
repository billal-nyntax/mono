import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class SignUpRequestDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    example: 'StrongP@ss1',
    minLength: 8,
    description: 'Password must contain uppercase, lowercase, number, and special character',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain at least one uppercase, one lowercase, one number, and one special character',
  })
  readonly password!: string;

  @ApiProperty({ example: 'StrongP@ss1', description: 'Must match password' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  readonly confirmPassword!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  readonly name!: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  readonly phone?: string;
}
