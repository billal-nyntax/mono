import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import {
  UploadService,
  type UploadResult,
  type UploadOptions,
  type DeleteResult,
} from '../upload.port';
import type { UploadConfig } from '../upload.config';

export class CloudinaryUploadService extends UploadService {
  private readonly defaults: UploadConfig['defaults'];

  constructor(config: UploadConfig) {
    super();
    if (!config.cloudinary) {
      throw new Error('Cloudinary config required: cloudName, apiKey, apiSecret');
    }

    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });

    this.defaults = config.defaults;
  }

  async upload(
    file: Buffer | string,
    _filename: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const opts = this.buildUploadOptions(options);

    if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, opts);
      return this.toResult(result);
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
        if (err) return reject(new Error(`Cloudinary upload failed: ${err.message}`));
        if (!result) return reject(new Error('Cloudinary returned no result'));
        resolve(this.toResult(result));
      });
      stream.end(file);
    });
  }

  async uploadFromUrl(url: string, options?: UploadOptions): Promise<UploadResult> {
    const opts = this.buildUploadOptions(options);
    const result = await cloudinary.uploader.upload(url, opts);
    return this.toResult(result);
  }

  async delete(publicId: string): Promise<DeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: result.result === 'ok' };
    } catch {
      return { success: false };
    }
  }

  async deleteMany(publicIds: string[]): Promise<DeleteResult[]> {
    if (publicIds.length === 0) return [];

    try {
      const response = await cloudinary.api.delete_resources(publicIds);
      return publicIds.map((id) => ({
        success: response.deleted[id] === 'deleted',
      }));
    } catch {
      return Promise.all(publicIds.map((id) => this.delete(id)));
    }
  }

  getUrl(
    publicId: string,
    options?: { width?: number; height?: number; quality?: number },
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          crop: options?.width || options?.height ? 'limit' : undefined,
          quality: options?.quality ?? 'auto',
          fetch_format: 'auto',
        },
      ],
    });
  }

  /**
   * Extracts Cloudinary public ID from a full URL.
   * E.g. "https://res.cloudinary.com/xxx/image/upload/v123/products/abc.jpg"
   *   → "products/abc"
   */
  extractPublicId(url: string): string {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');

      const uploadIdx = parts.indexOf('upload');
      if (uploadIdx === -1) return url;

      // Skip version segment (e.g. "v1234567890")
      let startIdx = uploadIdx + 1;
      if (parts[startIdx]?.startsWith('v') && /^\d+$/.test(parts[startIdx]?.slice(1) ?? '')) {
        startIdx++;
      }

      const publicIdWithExt = parts.slice(startIdx).join('/');
      return publicIdWithExt.replace(/\.[^/.]+$/, '');
    } catch {
      return url;
    }
  }

  private buildUploadOptions(options?: UploadOptions) {
    return {
      folder: options?.folder ?? this.defaults?.folder ?? 'uploads',
      resource_type: 'image' as const,
      transformation: {
        width: options?.maxWidth ?? this.defaults?.maxWidth ?? 1200,
        crop: 'limit' as const,
        quality: options?.quality ?? this.defaults?.quality ?? 'auto',
        fetch_format: (options?.format ?? 'auto') as string,
      },
      unique_filename: true,
      overwrite: false,
    };
  }

  private toResult(raw: UploadApiResponse): UploadResult {
    return {
      url: raw.secure_url,
      publicId: raw.public_id,
      width: raw.width,
      height: raw.height,
      format: raw.format,
      size: raw.bytes,
    };
  }
}
