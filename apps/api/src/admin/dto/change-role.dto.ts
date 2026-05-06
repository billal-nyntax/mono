import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({ enum: ['user', 'admin', 'super_admin'], description: 'New role to assign' })
  @IsEnum(['user', 'admin', 'super_admin'] as const)
  readonly role!: 'user' | 'admin' | 'super_admin';
}
