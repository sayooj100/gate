import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found at', envPath);
    process.exit(1);
  }
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
const accountId = env.R2_ACCOUNT_ID;
const accessKeyId = env.R2_ACCESS_KEY_ID;
const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
const bucketName = env.R2_BUCKET_NAME;
const endpoint = env.R2_ENDPOINT_URL || `https://${accountId}.r2.cloudflarestorage.com`;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  console.error('Error: Missing required R2 credentials in .env.local.');
  console.error('Please ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME are set.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.json': return 'application/json';
    case '.webp': return 'image/webp';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function uploadFile(localPath, r2Key) {
  if (!fs.existsSync(localPath)) {
    console.warn(`Skipping non-existent local file: ${localPath}`);
    return;
  }
  const fileContent = fs.readFileSync(localPath);
  const contentType = getContentType(localPath);

  console.log(`Uploading: ${r2Key} (${(fileContent.length / 1024).toFixed(1)} KB)...`);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3.send(command);
  console.log(`✓ Uploaded: ${r2Key}`);
}

async function main() {
  console.log(`Connecting to R2 Bucket: "${bucketName}"...`);

  const filesToUpload = [
    { local: path.join(process.cwd(), 'data', 'master.json'), key: 'master.json' },
    { local: path.join(process.cwd(), 'data', 'questions', 'BM.json'), key: 'questions/BM.json' },
    { local: path.join(process.cwd(), 'data', 'images', 'branches', 'BM.webp'), key: 'images/branches/BM.webp' },
    { local: path.join(process.cwd(), 'data', 'images', 'branches', 'GA.webp'), key: 'images/branches/GA.webp' },
    { local: path.join(process.cwd(), 'data', 'images', 'error.webp'), key: 'images/error.webp' },
  ];

  // Also check if any question images exist in data/images/questions
  const qImagesDir = path.join(process.cwd(), 'data', 'images', 'questions');
  if (fs.existsSync(qImagesDir)) {
    const qFiles = fs.readdirSync(qImagesDir);
    for (const qf of qFiles) {
      filesToUpload.push({
        local: path.join(qImagesDir, qf),
        key: `images/questions/${qf}`
      });
    }
  }

  for (const item of filesToUpload) {
    try {
      await uploadFile(item.local, item.key);
    } catch (err) {
      console.error(`✗ Failed uploading ${item.key}:`, err.message);
    }
  }

  console.log('\nAll done! Cloudflare R2 bucket is populated.');
}

main().catch(err => {
  console.error('Upload script encountered an error:', err);
  process.exit(1);
});
