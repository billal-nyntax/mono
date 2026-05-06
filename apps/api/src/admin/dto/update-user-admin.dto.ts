import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean, MaxLength } from 'class-validator';

export class UpdateUserAdminDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @ApiProperty({ example: '+1234567890', required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly phone?: string | null;

  @ApiProperty({ enum: ['user', 'admin', 'super_admin'], required: false })
  @IsOptional()
  @IsEnum(['user', 'admin', 'super_admin'] as const)
  readonly role?: 'user' | 'admin' | 'super_admin';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly emailVerified?: boolean;
}
