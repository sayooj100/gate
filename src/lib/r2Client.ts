import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Cache client singleton across requests
let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!s3ClientInstance) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT_URL || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

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

export function getR2BucketName(): string | null {
  return process.env.R2_BUCKET_NAME || null;
}

/**
 * Fetch a JSON object from Cloudflare R2 bucket.
 */
export async function fetchJsonFromR2<T>(key: string): Promise<T | null> {
  const s3 = getS3Client();
  const bucket = getR2BucketName();

  if (!s3 || !bucket) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await s3.send(command);
    if (!response.Body) return null;

    const str = await response.Body.transformToString('utf-8');
    return JSON.parse(str) as T;
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err.name === 'NoSuchKey' || err.name === 'NotFound') {
      return null;
    }
    console.error(`Error fetching "${key}" from R2 bucket "${bucket}":`, err.message || error);
    return null;
  }
}

/**
 * Save a JSON object to Cloudflare R2 bucket.
 */
export async function saveJsonToR2<T>(key: string, data: T): Promise<boolean> {
  const s3 = getS3Client();
  const bucket = getR2BucketName();

  if (!s3 || !bucket) return false;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });
    await s3.send(command);
    return true;
  } catch (error) {
    console.error(`Error saving "${key}" to R2 bucket "${bucket}":`, error);
    return false;
  }
}

/**
 * Upload binary buffer/file to Cloudflare R2 bucket.
 */
export async function uploadBufferToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<boolean> {
  const s3 = getS3Client();
  const bucket = getR2BucketName();

  if (!s3 || !bucket) return false;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await s3.send(command);
    return true;
  } catch (error) {
    console.error(`Error uploading "${key}" to R2 bucket "${bucket}":`, error);
    return false;
  }
}
