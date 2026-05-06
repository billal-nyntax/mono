import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { createUserId } from '@repo/auth-core';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;

  const mockUser = {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user' as const,
    phone: null,
    emailVerified: false,
    twoFactorEnabled: false,
    suspended: false,
    suspendedAt: null,
    suspendedReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      countFiltered: vi.fn(),
      findMany: vi.fn(),
    };

    service = new UserService(userRepository);
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(createUserId('user-1'));

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('suspend', () => {
    it('sets suspended=true with reason and timestamp', async () => {
      const suspendedUser = {
        ...mockUser,
        suspended: true,
        suspendedAt: new Date(),
        suspendedReason: 'Violation',
      };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(suspendedUser);

      const result = await service.suspend(createUserId('user-1'), 'Violation');

      expect(result).toEqual(suspendedUser);
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          suspended: true,
          suspendedReason: 'Violation',
        }),
      );
      const call = userRepository.update.mock.calls[0][1];
      expect(call.suspendedAt).toBeInstanceOf(Date);
    });

    it('sets suspendedReason to null when no reason given', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        suspended: true,
        suspendedAt: new Date(),
        suspendedReason: null,
      });

      await service.suspend(createUserId('user-1'));

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          suspended: true,
          suspendedReason: null,
        }),
      );
    });
  });

  describe('unsuspend', () => {
    it('clears suspension fields', async () => {
      const suspendedUser = {
        ...mockUser,
        suspended: true,
        suspendedAt: new Date(),
        suspendedReason: 'Violation',
      };
      const unsuspendedUser = {
        ...mockUser,
        suspended: false,
        suspendedAt: null,
        suspendedReason: null,
      };
      userRepository.findById.mockResolvedValue(suspendedUser);
      userRepository.update.mockResolvedValue(unsuspendedUser);

      const result = await service.unsuspend(createUserId('user-1'));

      expect(result).toEqual(unsuspendedUser);
      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        suspended: false,
        suspendedAt: null,
        suspendedReason: null,
      });
    });
  });

  describe('delete', () => {
    it('calls repository delete', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await service.delete(createUserId('user-1'));

      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
