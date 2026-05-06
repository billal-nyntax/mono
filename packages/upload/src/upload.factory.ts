import type { UploadConfig } from './upload.config';
import { UploadService } from './upload.port';
import { CloudinaryUploadService } from './adapters/cloudinary.adapter';
import { LocalUploadService } from './adapters/local.adapter';
import { S3UploadService } from './adapters/s3.adapter';

/**
 * Factory to create the upload service based on config.
 *
 * To switch providers: change UPLOAD_PROVIDER in .env
 *   - 'local'      → saves to disk (development)
 *   - 'cloudinary'  → uploads to Cloudinary CDN
 *   - 's3'          → uploads to AWS S3 (needs @aws-sdk/client-s3)
 *
 * To add a new provider:
 *   1. Create adapters/newprovider.adapter.ts extending UploadService
 *   2. Add case here
 *   3. Add config type in upload.config.ts
 */
export function createUploadService(config: UploadConfig): UploadService {
  switch (config.provider) {
    case 'cloudinary':
      return new CloudinaryUploadService(config);
    case 'local':
      return new LocalUploadService(config);
    case 's3':
      return new S3UploadService(config);
    default:
      throw new Error(`Unknown upload provider: "${String(config.provider)}". Use: cloudinary, local, or s3`);
  }
}
