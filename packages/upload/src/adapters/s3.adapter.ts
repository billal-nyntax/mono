import {
  UploadService,
  type UploadResult,
  type UploadOptions,
  type DeleteResult,
} from '../upload.port';
import type { UploadConfig } from '../upload.config';

/**
 * AWS S3 adapter — ready to implement.
 *
 * To use:
 *   1. Install: pnpm add @aws-sdk/client-s3 @aws-sdk/lib-storage
 *   2. Implement methods below
 *   3. Set UPLOAD_PROVIDER=s3 in .env
 *   4. Set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 */
export class S3UploadService extends UploadService {
  private readonly bucket: string;
  private readonly region: string;

  constructor(config: UploadConfig) {
    super();
    if (!config.s3) throw new Error('S3 config required: bucket, region, accessKeyId, secretAccessKey');
    this.bucket = config.s3.bucket;
    this.region = config.s3.region;

    // TODO: Initialize S3 client
    // const { S3Client } = require('@aws-sdk/client-s3');
    // this.client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  }

  async upload(
    _file: Buffer | string,
    _filename: string,
    _options?: UploadOptions,
  ): Promise<UploadResult> {
    // TODO: Implement using @aws-sdk/lib-storage Upload
    throw new Error('S3 upload not implemented. Install @aws-sdk/client-s3 and implement.');
  }

  async uploadFromUrl(
    _url: string,
    _options?: UploadOptions,
  ): Promise<UploadResult> {
    throw new Error('S3 uploadFromUrl not implemented');
  }

  async delete(_publicId: string): Promise<DeleteResult> {
    // TODO: Implement using DeleteObjectCommand
    throw new Error('S3 delete not implemented');
  }

  getUrl(publicId: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${publicId}`;
  }

  /**
   * Extracts S3 key from URL.
   * E.g. "https://bucket.s3.region.amazonaws.com/products/abc.jpg" → "products/abc.jpg"
   */
  extractPublicId(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.slice(1); // remove leading "/"
    } catch {
      return url;
    }
  }
}
