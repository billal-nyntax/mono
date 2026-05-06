export interface ProductEntity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly category: string;
  readonly brandId: string;
  readonly brand: string;
  readonly model: string | null;
  readonly description: string | null;
  readonly purchasePrice: number;
  readonly sellingPrice: number;
  readonly stockQuantity: number;
  readonly sku: string | null;
  readonly images: string[];
  readonly status: 'AVAILABLE' | 'OUT_OF_STOCK';
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProductQueryParams {
  readonly skip: number;
  readonly take: number;
  readonly search?: string;
  readonly categoryId?: string;
  readonly brandId?: string;
  readonly status?: 'AVAILABLE' | 'OUT_OF_STOCK';
  readonly lowStock?: boolean;
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

export interface ProductListResult {
  readonly data: ProductEntity[];
  readonly total: number;
}

export interface CreateProductData {
  readonly name: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly brandId: string;
  readonly model?: string;
  readonly description?: string;
  readonly purchasePrice: number;
  readonly sellingPrice: number;
  readonly stockQuantity?: number;
  readonly sku?: string;
  readonly images?: string[];
}

export interface UpdateProductData {
  readonly name?: string;
  readonly slug?: string;
  readonly categoryId?: string;
  readonly brandId?: string;
  readonly model?: string | null;
  readonly description?: string | null;
  readonly purchasePrice?: number;
  readonly sellingPrice?: number;
  readonly stockQuantity?: number;
  readonly sku?: string | null;
  readonly images?: string[];
  readonly status?: 'AVAILABLE' | 'OUT_OF_STOCK';
}

export abstract class ProductRepository {
  abstract findMany(params: ProductQueryParams): Promise<ProductListResult>;
  abstract findById(id: string): Promise<ProductEntity | null>;
  abstract findBySlug(slug: string): Promise<ProductEntity | null>;
  abstract findBySku(sku: string): Promise<ProductEntity | null>;
  abstract create(data: CreateProductData): Promise<ProductEntity>;
  abstract update(id: string, data: UpdateProductData): Promise<ProductEntity>;
  abstract delete(id: string): Promise<void>;
  abstract getBrands(): Promise<string[]>;
}
