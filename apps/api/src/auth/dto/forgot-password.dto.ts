import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'john@example.com', description: 'Account email address' })
  @IsEmail()
  readonly email!: string;
}
