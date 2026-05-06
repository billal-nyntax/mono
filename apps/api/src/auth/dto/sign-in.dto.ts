import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInRequestDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  readonly password!: string;
}
