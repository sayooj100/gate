import fs from 'fs';
import path from 'path';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT_URL || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  console.log(`Connecting to R2 Bucket: "${env.R2_BUCKET_NAME}"...`);
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
    })
  );

  console.log(`\nFound ${res.KeyCount || 0} object(s) in bucket:`);
  if (res.Contents) {
    for (const item of res.Contents) {
      console.log(` - ${item.Key} (${(item.Size / 1024).toFixed(1)} KB) [Modified: ${item.LastModified}]`);
    }
  }
}

main().catch(console.error);
