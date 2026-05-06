import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: any;
  let uploadService: any;

  const mockProduct = {
    id: 'prod-1',
    name: 'Widget',
    slug: 'widget',
    categoryId: 'cat-1',
    category: 'Electronics',
    brandId: 'brand-1',
    brand: 'Acme',
    model: null,
    description: null,
    purchasePrice: 100,
    sellingPrice: 150,
    stockQuantity: 10,
    sku: 'WDG-001',
    images: ['https://cdn.example.com/img1.jpg', 'https://cdn.example.com/img2.jpg'],
    status: 'AVAILABLE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    productRepository = {
      findMany: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findBySku: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getBrands: vi.fn(),
    };

    uploadService = {
      deleteByUrls: vi.fn(),
    };

    service = new ProductService(productRepository, uploadService);
  });

  describe('create', () => {
    it('throws ConflictException when slug already exists', async () => {
      productRepository.findBySlug.mockResolvedValue(mockProduct);

      await expect(
        service.create({
          name: 'Widget',
          slug: 'widget',
          categoryId: 'cat-1',
          brandId: 'brand-1',
          purchasePrice: 100,
          sellingPrice: 150,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates product and returns entity', async () => {
      productRepository.findBySlug.mockResolvedValue(null);
      productRepository.findBySku.mockResolvedValue(null);
      productRepository.create.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'Widget',
        slug: 'widget',
        categoryId: 'cat-1',
        brandId: 'brand-1',
        purchasePrice: 100,
        sellingPrice: 150,
        sku: 'WDG-001',
      });

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws ConflictException when changing to an existing slug', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.findBySlug.mockResolvedValue({ ...mockProduct, id: 'prod-2', slug: 'new-slug' });

      await expect(
        service.update('prod-1', { slug: 'new-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('sets status OUT_OF_STOCK when stockQuantity is 0', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.findBySlug.mockResolvedValue(null);
      productRepository.update.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 0,
        status: 'OUT_OF_STOCK',
      });

      await service.update('prod-1', { stockQuantity: 0 });

      expect(productRepository.update).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining({ status: 'OUT_OF_STOCK' }),
      );
    });

    it('cleans up removed images', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.update.mockResolvedValue({
        ...mockProduct,
        images: ['https://cdn.example.com/img1.jpg'],
      });
      uploadService.deleteByUrls.mockResolvedValue([{ success: true }]);

      await service.update('prod-1', { images: ['https://cdn.example.com/img1.jpg'] });

      expect(uploadService.deleteByUrls).toHaveBeenCalledWith([
        'https://cdn.example.com/img2.jpg',
      ]);
    });
  });

  describe('delete', () => {
    it('deletes product and cleans up images', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.delete.mockResolvedValue(undefined);
      uploadService.deleteByUrls.mockResolvedValue([
        { success: true },
        { success: true },
      ]);

      await service.delete('prod-1');

      expect(productRepository.delete).toHaveBeenCalledWith('prod-1');
      expect(uploadService.deleteByUrls).toHaveBeenCalledWith(mockProduct.images);
    });

    it('throws NotFoundException when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
