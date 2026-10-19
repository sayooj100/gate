import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

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
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: 'questions/AE.json',
    })
  );
  const str = await res.Body.transformToString('utf-8');
  const json = JSON.parse(str);
  console.log('AE Paper name:', json.metadata?.paper_name);
  console.log('AE Paper code:', json.metadata?.paper_code);
  console.log('AE Topics count:', json.metadata?.topics?.length);
  console.log('AE Total questions:', json.questions?.length);
}

main().catch(console.error);
