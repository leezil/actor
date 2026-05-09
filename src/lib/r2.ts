import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function getEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "Cloudflare R2 환경 변수가 누락되었습니다. .env.local 또는 Vercel 환경변수를 확인하세요."
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

function createClient() {
  const { accountId, accessKeyId, secretAccessKey } = getEnv();
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadJson(key: string, value: unknown) {
  const client = createClient();
  const { bucketName } = getEnv();
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "application/json",
      Body: JSON.stringify(value, null, 2),
    })
  );
}

export async function uploadBytes(
  key: string,
  bytes: Buffer,
  contentType: string
) {
  const client = createClient();
  const { bucketName } = getEnv();
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    })
  );
}

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const client = createClient();
    const { bucketName } = getEnv();
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    const body = await res.Body?.transformToString("utf-8");
    if (!body) {
      return null;
    }
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

export async function removeObject(key: string) {
  const client = createClient();
  const { bucketName } = getEnv();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}
