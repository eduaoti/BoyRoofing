import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  SITE_IMAGE_KEYS,
  DEFAULT_SITE_IMAGE_URLS,
  type SiteImageKey,
} from './site-images.constants';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

@Injectable()
export class SiteImagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Devuelve el mapa key -> url (override de BD o default) */
  async getImageMap(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteImage.findMany();
    const map: Record<string, string> = {};

    for (const key of SITE_IMAGE_KEYS) {
      const row = rows.find((r) => r.key === key);
      map[key] = row ? row.url : DEFAULT_SITE_IMAGE_URLS[key];
    }
    return map;
  }

  /** Actualiza la URL de una key (upsert) */
  async setImageUrl(key: string, url: string): Promise<{ key: string; url: string }> {
    if (!SITE_IMAGE_KEYS.includes(key as SiteImageKey)) {
      throw new BadRequestException(`Invalid image key: ${key}`);
    }
    await this.prisma.siteImage.upsert({
      where: { key },
      create: { key, url },
      update: { url },
    });
    return { key, url };
  }

  /** Sube un archivo a Cloudinary y devuelve la URL. */
  async uploadToCloudinary(
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{ url: string; publicId: string }> {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
      );
    }

    const v2 = await import('cloudinary').then((c) => c.v2);
    v2.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    return new Promise((resolve, reject) => {
      v2.uploader.upload(dataUri, { folder: 'boysroofing' }, (err: unknown, result?: { secure_url?: string; public_id?: string }) => {
        if (err) {
          reject(new BadRequestException(`Cloudinary upload failed: ${(err as Error).message}`));
          return;
        }
        if (!result?.secure_url || !result?.public_id) {
          reject(new BadRequestException('Cloudinary upload failed: no result'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
    });
  }
}
