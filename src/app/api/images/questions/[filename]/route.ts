import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!s3ClientInstance) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint =
      process.env.R2_ENDPOINT_URL ||
      (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

    if (!accessKeyId || !secretAccessKey || !endpoint) {
      return null;
    }

    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;

  if (!filename) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Prevent directory traversal
  const sanitized = path.basename(filename);
  const s3 = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME;

  if (s3 && bucket) {
    // Try both common locations: "questions/<filename>" or "images/questions/<filename>"
    const candidateKeys = [
      `questions/${sanitized}`,
      `images/questions/${sanitized}`,
    ];

    for (const key of candidateKeys) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        const response = await s3.send(command);

        if (response.Body) {
          const bytes = await response.Body.transformToByteArray();
          const contentType =
            response.ContentType ||
            (sanitized.endsWith('.webp') ? 'image/webp' : 'image/png');

          return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error.name !== 'NoSuchKey' && error.name !== 'NotFound') {
          console.error(`Error streaming ${key} from R2:`, err);
        }
      }
    }
  }

  // Fallback: check local public/images/error.webp
  try {
    const fallbackPath = path.join(process.cwd(), 'public', 'error.webp');
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch {
    // ignore
  }

  return new NextResponse('Image not found', { status: 404 });
}
