import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import {
  ProductRepository,
  type ProductEntity,
  type ProductListResult,
} from './repositories/product.repository';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { ProductQueryDto } from './dto/product-query.dto';
import { UploadService } from '@repo/upload';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly uploadService: UploadService,
  ) {}

  async findMany(query: ProductQueryDto): Promise<ProductListResult & {
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (query.page - 1) * query.limit;

    const result = await this.productRepository.findMany({
      skip,
      take: query.limit,
      search: query.search,
      categoryId: query.categoryId,
      brandId: query.brandId,
      status: query.status,
      lowStock: query.lowStock,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      ...result,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(result.total / query.limit),
    };
  }

  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    await this.validateUniqueFields(dto.slug, dto.sku);

    try {
      return await this.productRepository.create(dto);
    } catch (error) {
      if (dto.images?.length) {
        this.logger.warn(
          `Product creation failed — cleaning up ${String(dto.images.length)} uploaded image(s)`,
        );
        await this.cleanupImages(dto.images);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const existing = await this.findById(id);

    if (dto.slug && dto.slug !== existing.slug) {
      const bySlug = await this.productRepository.findBySlug(dto.slug);
      if (bySlug) {
        throw new ConflictException(`Product with slug "${dto.slug}" already exists`);
      }
    }

    if (dto.sku !== undefined && dto.sku !== existing.sku && dto.sku !== null) {
      const bySku = await this.productRepository.findBySku(dto.sku);
      if (bySku) {
        throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
      }
    }

    const updateData: Record<string, unknown> = { ...dto };

    if (dto.stockQuantity !== undefined) {
      updateData.status = dto.stockQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    }

    const updated = await this.productRepository.update(id, updateData);

    if (dto.images) {
      const removedImages = (existing.images ?? []).filter(
        (oldUrl) => !dto.images!.includes(oldUrl),
      );
      if (removedImages.length > 0) {
        this.logger.log(
          `Product ${id} updated — cleaning up ${String(removedImages.length)} removed image(s)`,
        );
        void this.cleanupImages(removedImages);
      }
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);

    await this.productRepository.delete(id);

    if (product.images?.length) {
      this.logger.log(
        `Product ${id} deleted — cleaning up ${String(product.images.length)} image(s)`,
      );
      void this.cleanupImages(product.images);
    }
  }

  async getBrands(): Promise<string[]> {
    return this.productRepository.getBrands();
  }

  private async validateUniqueFields(slug: string, sku?: string): Promise<void> {
    const bySlug = await this.productRepository.findBySlug(slug);
    if (bySlug) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    if (sku) {
      const bySku = await this.productRepository.findBySku(sku);
      if (bySku) {
        throw new ConflictException(`Product with SKU "${sku}" already exists`);
      }
    }
  }

  private async cleanupImages(urls: string[]): Promise<void> {
    try {
      const results = await this.uploadService.deleteByUrls(urls);
      const succeeded = results.filter((r) => r.success).length;
      const failed = results.length - succeeded;

      if (failed > 0) {
        this.logger.warn(`Image cleanup: ${String(succeeded)} deleted, ${String(failed)} failed`);
      } else {
        this.logger.log(`Image cleanup: ${String(succeeded)} deleted successfully`);
      }
    } catch (error) {
      this.logger.error('Image cleanup failed', error);
    }
  }
}
