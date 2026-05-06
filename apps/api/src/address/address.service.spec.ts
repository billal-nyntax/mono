import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddressService } from './address.service';

describe('AddressService', () => {
  let service: AddressService;
  let addressRepository: any;

  const mockAddress = {
    id: 'addr-1',
    userId: 'user-1',
    label: 'Home',
    street: '123 Main St',
    city: 'Dhaka',
    state: 'Dhaka',
    postalCode: '1000',
    country: 'BD',
    isDefault: true,
  };

  beforeEach(() => {
    addressRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      setDefault: vi.fn(),
    };

    service = new AddressService(addressRepository);
  });

  describe('ownership validation', () => {
    it('throws NotFoundException when address does not exist', async () => {
      addressRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('addr-999', 'user-1', { label: 'Office' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when userId does not match', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress);

      await expect(
        service.update('addr-1', 'other-user', { label: 'Office' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows update when correct userId owns the address', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress);
      addressRepository.update.mockResolvedValue({ ...mockAddress, label: 'Office' });

      const result = await service.update('addr-1', 'user-1', { label: 'Office' });

      expect(result.label).toBe('Office');
      expect(addressRepository.update).toHaveBeenCalledWith('addr-1', { label: 'Office' });
    });

    it('throws ForbiddenException on delete when userId does not match', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress);

      await expect(
        service.delete('addr-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows delete when correct userId owns the address', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress);
      addressRepository.delete.mockResolvedValue(undefined);

      await service.delete('addr-1', 'user-1');

      expect(addressRepository.delete).toHaveBeenCalledWith('addr-1');
    });

    it('throws ForbiddenException on setDefault when userId does not match', async () => {
      addressRepository.findById.mockResolvedValue(mockAddress);

      await expect(
        service.setDefault('addr-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
