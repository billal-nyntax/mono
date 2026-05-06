export interface UploadConfig {
  readonly provider: 'cloudinary' | 'local' | 's3';
  readonly cloudinary?: {
    readonly cloudName: string;
    readonly apiKey: string;
    readonly apiSecret: string;
  };
  readonly s3?: {
    readonly bucket: string;
    readonly region: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
  readonly local?: {
    readonly uploadDir: string;
    readonly baseUrl: string;
  };
  readonly defaults?: {
    readonly folder: string;
    readonly maxWidth: number;
    readonly quality: number;
  };
}
