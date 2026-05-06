import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: any;

  const mockCategory = {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    icon: null,
    _count: { products: 0 },
  };

  beforeEach(() => {
    prisma = {
      productCategory: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new CategoryService(prisma);
  });

  describe('create', () => {
    it('throws ConflictException when slug already exists', async () => {
      prisma.productCategory.findUnique.mockResolvedValue(mockCategory);

      await expect(
        service.create({ name: 'Electronics', slug: 'electronics' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates category when slug is unique', async () => {
      prisma.productCategory.findUnique.mockResolvedValue(null);
      prisma.productCategory.create.mockResolvedValue(mockCategory);

      const result = await service.create({
        name: 'Electronics',
        slug: 'electronics',
      });

      expect(result).toEqual(mockCategory);
      expect(prisma.productCategory.create).toHaveBeenCalledWith({
        data: { name: 'Electronics', slug: 'electronics' },
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when category does not exist', async () => {
      prisma.productCategory.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when changing to an existing slug', async () => {
      prisma.productCategory.findUnique
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce({ ...mockCategory, id: 'cat-2', slug: 'taken' });

      await expect(
        service.update('cat-1', { slug: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('updates category when new slug is unique', async () => {
      const updated = { ...mockCategory, slug: 'new-slug' };
      prisma.productCategory.findUnique
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);
      prisma.productCategory.update.mockResolvedValue(updated);

      const result = await service.update('cat-1', { slug: 'new-slug' });

      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('throws ConflictException when category has products', async () => {
      prisma.productCategory.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: { products: 5 },
      });

      await expect(service.delete('cat-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('deletes category when it has no products', async () => {
      prisma.productCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.productCategory.delete.mockResolvedValue(undefined);

      await service.delete('cat-1');

      expect(prisma.productCategory.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('throws NotFoundException when category does not exist', async () => {
      prisma.productCategory.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
