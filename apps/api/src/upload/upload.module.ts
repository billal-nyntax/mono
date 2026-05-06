import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadService, createUploadService } from '@repo/upload';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [
    {
      provide: UploadService,
      useFactory: (configService: ConfigService) => {
        /**
         * SWAP POINT: Change provider here.
         * For production: use 'cloudinary' with real credentials.
         * For development: use 'local' to save to disk.
         */
        const provider = configService.get<string>('UPLOAD_PROVIDER', 'local');

        return createUploadService({
          provider: provider as 'cloudinary' | 'local' | 's3',
          cloudinary: configService.get('CLOUDINARY_CLOUD_NAME')
            ? {
                cloudName: configService.get<string>('CLOUDINARY_CLOUD_NAME', ''),
                apiKey: configService.get<string>('CLOUDINARY_API_KEY', ''),
                apiSecret: configService.get<string>('CLOUDINARY_API_SECRET', ''),
              }
            : undefined,
          s3: configService.get('S3_BUCKET')
            ? {
                bucket: configService.get<string>('S3_BUCKET', ''),
                region: configService.get<string>('S3_REGION', 'ap-southeast-1'),
                accessKeyId: configService.get<string>('S3_ACCESS_KEY_ID', ''),
                secretAccessKey: configService.get<string>('S3_SECRET_ACCESS_KEY', ''),
              }
            : undefined,
          local: {
            uploadDir: './uploads',
            baseUrl: `${configService.get<string>('API_BASE_URL', 'http://localhost:4000')}/uploads`,
          },
          defaults: {
            folder: 'products',
            maxWidth: 1200,
            quality: 85,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
