/**
 * Upload port — defines what any upload provider must implement.
 *
 * To swap providers:
 *   1. Create a new adapter (e.g., S3Adapter, LocalAdapter)
 *   2. Change UPLOAD_PROVIDER in .env
 *   3. Everything else stays unchanged
 */
export interface UploadResult {
  readonly url: string;
  readonly publicId: string;
  readonly width?: number;
  readonly height?: number;
  readonly format?: string;
  readonly size?: number;
}

export interface UploadOptions {
  readonly folder?: string;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly quality?: number;
  readonly format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export interface DeleteResult {
  readonly success: boolean;
}

export abstract class UploadService {
  abstract upload(
    file: Buffer | string,
    filename: string,
    options?: UploadOptions,
  ): Promise<UploadResult>;

  abstract uploadFromUrl(
    url: string,
    options?: UploadOptions,
  ): Promise<UploadResult>;

  abstract delete(publicId: string): Promise<DeleteResult>;

  /**
   * Delete multiple files by their public IDs.
   * Continues on individual failures — returns results for each.
   */
  async deleteMany(publicIds: string[]): Promise<DeleteResult[]> {
    return Promise.all(publicIds.map((id) => this.delete(id)));
  }

  /**
   * Delete files by their URLs (extracts publicId internally).
   * Use this when you only have URLs (e.g., from product.images[]).
   */
  async deleteByUrls(urls: string[]): Promise<DeleteResult[]> {
    const ids = urls.map((url) => this.extractPublicId(url)).filter(Boolean);
    if (ids.length === 0) return [];
    return this.deleteMany(ids);
  }

  abstract getUrl(publicId: string, options?: { width?: number; height?: number; quality?: number }): string;

  /**
   * Extract the provider-specific public ID from a full URL.
   * Each adapter must implement this based on its URL format.
   */
  abstract extractPublicId(url: string): string;
}
