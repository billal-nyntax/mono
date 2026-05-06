import { Injectable, NotFoundException } from '@nestjs/common';
import type { User, UserId } from '@repo/auth-core';
import { UserRepository, type UpdateUserData } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: UserId): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: UserId, data: UpdateUserData): Promise<User> {
    await this.findById(id);
    return this.userRepository.update(id, data);
  }

  async suspend(id: UserId, reason?: string): Promise<User> {
    await this.findById(id);
    return this.userRepository.update(id, {
      suspended: true,
      suspendedAt: new Date(),
      suspendedReason: reason ?? null,
    });
  }

  async unsuspend(id: UserId): Promise<User> {
    await this.findById(id);
    return this.userRepository.update(id, {
      suspended: false,
      suspendedAt: null,
      suspendedReason: null,
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }

  async list(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const skip = (params.page - 1) * params.limit;
    const [users, total] = await Promise.all([
      this.userRepository.findMany({
        skip,
        take: params.limit,
        search: params.search,
      }),
      this.userRepository.countFiltered(params.search),
    ]);
    return { users, total };
  }
}
