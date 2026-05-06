import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BrandService } from './brand.service';

describe('BrandService', () => {
  let service: BrandService;
  let prisma: any;

  const mockBrand = {
    id: 'brand-1',
    name: 'Acme',
    slug: 'acme',
    logo: null,
    _count: { products: 0 },
  };

  beforeEach(() => {
    prisma = {
      brand: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new BrandService(prisma);
  });

  describe('create', () => {
    it('throws ConflictException when slug already exists', async () => {
      prisma.brand.findUnique.mockResolvedValue(mockBrand);

      await expect(
        service.create({ name: 'Acme', slug: 'acme' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates brand when slug is unique', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);
      prisma.brand.create.mockResolvedValue(mockBrand);

      const result = await service.create({ name: 'Acme', slug: 'acme' });

      expect(result).toEqual(mockBrand);
      expect(prisma.brand.create).toHaveBeenCalledWith({
        data: { name: 'Acme', slug: 'acme' },
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when brand does not exist', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when changing to an existing slug', async () => {
      prisma.brand.findUnique
        .mockResolvedValueOnce(mockBrand)
        .mockResolvedValueOnce({ ...mockBrand, id: 'brand-2', slug: 'taken' });

      await expect(
        service.update('brand-1', { slug: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('updates brand when new slug is unique', async () => {
      const updated = { ...mockBrand, slug: 'new-slug' };
      prisma.brand.findUnique
        .mockResolvedValueOnce(mockBrand)
        .mockResolvedValueOnce(null);
      prisma.brand.update.mockResolvedValue(updated);

      const result = await service.update('brand-1', { slug: 'new-slug' });

      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('throws ConflictException when brand has products', async () => {
      prisma.brand.findUnique.mockResolvedValue({
        ...mockBrand,
        _count: { products: 3 },
      });

      await expect(service.delete('brand-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('deletes brand when it has no products', async () => {
      prisma.brand.findUnique.mockResolvedValue(mockBrand);
      prisma.brand.delete.mockResolvedValue(undefined);

      await service.delete('brand-1');

      expect(prisma.brand.delete).toHaveBeenCalledWith({
        where: { id: 'brand-1' },
      });
    });

    it('throws NotFoundException when brand does not exist', async () => {
      prisma.brand.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
