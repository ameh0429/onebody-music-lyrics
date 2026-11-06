import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const uploadDirectory = join(process.cwd(), 'uploads');
export const imageUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, done) => {
      mkdirSync(uploadDirectory, { recursive: true });
      done(null, uploadDirectory);
    },
    filename: (_req, file, done) => {
      const extensions: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
      };
      done(null, `image-${randomUUID()}${extensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, done) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype))
      return done(
        new BadRequestException('Only JPEG, PNG, GIF and WebP images are allowed'),
        false,
      );
    done(null, true);
  },
};
