import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  UploadService,
  type UploadResult,
  type UploadOptions,
  type DeleteResult,
} from '../upload.port';
import type { UploadConfig } from '../upload.config';

export class LocalUploadService extends UploadService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(config: UploadConfig) {
    super();
    this.uploadDir = config.local?.uploadDir ?? './uploads';
    this.baseUrl = config.local?.baseUrl ?? 'http://localhost:4000/uploads';
  }

  async upload(
    file: Buffer | string,
    filename: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const folder = options?.folder ?? 'general';
    const dir = join(this.uploadDir, folder);
    await mkdir(dir, { recursive: true });

    const ext = filename.split('.').pop() ?? 'jpg';
    const uniqueName = `${randomBytes(16).toString('hex')}.${ext}`;
    const filePath = join(dir, uniqueName);

    if (typeof file === 'string') {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${String(response.status)} ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(filePath, buffer);
    } else {
      await writeFile(filePath, file);
    }

    const url = `${this.baseUrl}/${folder}/${uniqueName}`;
    const publicId = `${folder}/${uniqueName}`;

    return {
      url,
      publicId,
      format: ext,
    };
  }

  async uploadFromUrl(url: string, options?: UploadOptions): Promise<UploadResult> {
    const filename = url.split('/').pop() ?? 'image.jpg';
    return this.upload(url, filename, options);
  }

  async delete(publicId: string): Promise<DeleteResult> {
    try {
      const filePath = join(this.uploadDir, publicId);
      await unlink(filePath);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  getUrl(publicId: string): string {
    return `${this.baseUrl}/${publicId}`;
  }

  /**
   * Extracts local public ID from URL.
   * E.g. "http://localhost:4000/uploads/products/abc123.jpg" → "products/abc123.jpg"
   */
  extractPublicId(url: string): string {
    try {
      const urlObj = new URL(url);
      const uploadsIdx = urlObj.pathname.indexOf('/uploads/');
      if (uploadsIdx === -1) return url;
      return urlObj.pathname.slice(uploadsIdx + '/uploads/'.length);
    } catch {
      return url;
    }
  }
}
