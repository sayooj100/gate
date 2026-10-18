import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Cache client singleton across requests
let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT_URL || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

    if (!accessKeyId || !secretAccessKey || !endpoint) {
      throw new Error('R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT_URL or R2_ACCOUNT_ID) are missing.');
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

export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME environment variable is missing.');
  }
  return bucket;
}

/**
 * Fetch a JSON object from Cloudflare R2 bucket.
 */
export async function fetchJsonFromR2<T>(key: string): Promise<T | null> {
  const s3 = getS3Client();
  const bucket = getR2BucketName();

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
