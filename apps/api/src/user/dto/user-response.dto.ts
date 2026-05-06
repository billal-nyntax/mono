import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty({ example: '+1234567890', required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly phone?: string | null;
}
