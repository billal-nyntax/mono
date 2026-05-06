import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UploadService, type UploadResult, type DeleteResult } from '@repo/upload';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Controller('admin/upload')
@ApiTags('Upload')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth('access-token')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiResponse({ status: 201, description: 'File uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_FILE_SIZE },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('folder') folder?: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided. Send a file with field name "file"');
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed: ${ALLOWED_MIMES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Max ${String(MAX_FILE_SIZE / 1024 / 1024)}MB`);
    }

    this.logger.log(`Uploading ${file.originalname} (${String(Math.round(file.size / 1024))}KB) to ${folder ?? 'products'}`);

    try {
      const result = await this.uploadService.upload(file.buffer, file.originalname, {
        folder: folder ?? 'products',
        maxWidth: 1200,
        quality: 85,
        format: 'auto',
      });

      this.logger.log(`Uploaded: ${result.url}`);
      return result;
    } catch (error) {
      this.logger.error('Upload failed', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Upload failed. Please try again.',
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete an uploaded image by URL' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async deleteFile(@Body('url') url: string): Promise<DeleteResult> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    this.logger.log(`Deleting image: ${url}`);

    try {
      const publicId = this.uploadService.extractPublicId(url);
      const result = await this.uploadService.delete(publicId);
      this.logger.log(`Delete ${result.success ? 'succeeded' : 'failed'}: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error('Delete failed', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Delete failed',
      );
    }
  }
}
