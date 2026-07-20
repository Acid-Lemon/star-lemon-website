import OSS from 'ali-oss';
import { getSettings } from './settings';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

let ossClient: InstanceType<typeof OSS> | null = null;

type OssClientV4 = InstanceType<typeof OSS> & {
  signatureUrlV4(
    method: 'GET' | 'PUT',
    expires: number,
    request: { queries?: Record<string, string> } | undefined,
    objectName: string
  ): Promise<string>;
  getObjectMeta(objectName: string): Promise<{
    res: { headers: Record<string, string | undefined> };
  }>;
  initMultipartUpload(objectName: string): Promise<{ uploadId: string }>;
  completeMultipartUpload(objectName: string, uploadId: string, parts: Array<{ number: number; etag: string }>): Promise<unknown>;
  abortMultipartUpload(objectName: string, uploadId: string): Promise<unknown>;
};

function asV4Client(client: InstanceType<typeof OSS>): OssClientV4 {
  return client as OssClientV4;
}

function getErrorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

export async function getOssClient() {
  if (ossClient) return ossClient;

  const settings = await getSettings();
  const region = settings.oss_region || 'oss-cn-hangzhou';
  const endpoint = settings.oss_endpoint?.trim();
  const accessKeyId = settings.oss_access_key_id || '';
  const accessKeySecret = settings.oss_access_key_secret || '';
  const bucket = settings.oss_bucket || '';

  if (!accessKeyId || !accessKeySecret || !bucket) {
    throw new Error('OSS 未配置完整，请填写 Bucket、Access Key ID 和 Access Key Secret');
  }

  const options: {
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region: string;
    secure: boolean;
    endpoint?: string;
  } = {
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
    secure: true,
  };

  if (endpoint) {
    options.endpoint = endpoint;
  }

  ossClient = new OSS(options);

  return ossClient;
}

export async function generateUploadCredentials(transferId: number, fileName: string) {
  const settings = await getSettings();
  const client = await getOssClient();
  const key = `file-transfer/${transferId}/${fileName}`;

  const credentials = await asV4Client(client).signatureUrlV4('PUT', 3600, undefined, key);

  return { key, uploadUrl: credentials, bucket: settings.oss_bucket || '' };
}

export function getTransferObjectKey(transferId: number, fileName: string): string {
  return `file-transfer/${transferId}/${fileName}`;
}

export async function initTransferMultipartUpload(transferId: number, fileName: string) {
  const client = await getOssClient();
  const key = getTransferObjectKey(transferId, fileName);
  const result = await asV4Client(client).initMultipartUpload(key);
  return { key, uploadId: result.uploadId };
}

export async function generatePartUploadUrl(key: string, uploadId: string, partNumber: number): Promise<string> {
  const client = await getOssClient();
  return asV4Client(client).signatureUrlV4('PUT', 3600, {
    queries: { uploadId, partNumber: String(partNumber) },
  }, key);
}

export async function completeTransferMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ number: number; etag: string }>
) {
  const client = await getOssClient();
  return asV4Client(client).completeMultipartUpload(key, uploadId, parts);
}

export async function abortTransferMultipartUpload(key: string, uploadId: string) {
  const client = await getOssClient();
  return asV4Client(client).abortMultipartUpload(key, uploadId);
}

export async function getFileSize(key: string): Promise<number> {
  const client = await getOssClient();
  const result = await asV4Client(client).getObjectMeta(key);
  const contentLength = result.res.headers['content-length'];
  return Number(contentLength);
}

export async function multipartUpload(
  fileName: string,
  fileBuffer: Buffer,
  onProgress?: (pct: number) => void
): Promise<string> {
  const client = await getOssClient();
  const key = `file-transfer/${Date.now()}-${Math.random().toString(36).substring(2, 8)}/${fileName}`;
  const tmpPath = join(tmpdir(), `${randomBytes(8).toString('hex')}-${fileName}`);

  writeFileSync(tmpPath, fileBuffer);

  try {
    let lastPct = 0;
    const result = await client.multipartUpload(key, tmpPath, {
      progress: async (pct: number) => {
        const rounded = Math.round(pct * 100);
        if (rounded !== lastPct) {
          lastPct = rounded;
          onProgress?.(rounded);
        }
      },
    });
    return result.name || key;
  } finally {
    unlinkSync(tmpPath);
  }
}

export async function generateDownloadUrl(key: string, fileName: string): Promise<string> {
  const settings = await getSettings();
  const esaDomain = settings.esa_domain?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (esaDomain) {
    return `https://${esaDomain}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }

  const client = await getOssClient();
  const signedUrl = await asV4Client(client).signatureUrlV4(
    'GET',
    300,
    {
      queries: {
        'response-content-disposition': `attachment; filename="${fileName}"`,
      },
    },
    key
  );

  return signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const client = await getOssClient();
    await client.delete(key);
  } catch (error: unknown) {
    if (getErrorCode(error) !== 'NoSuchKey') {
      console.error('Failed to delete OSS file:', key, getErrorMessage(error));
    }
  }
}

export function resetOssClient() {
  ossClient = null;
}

export function extractOssKey(urlOrKey: string | null | undefined): string | null {
  if (!urlOrKey) return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const pathname = new URL(trimmed).pathname;
      return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } catch {
      return null;
    }
  }

  return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
}

export async function getPublicUrl(urlOrKey: string | null | undefined): Promise<string | null> {
  if (!urlOrKey) return null;

  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const key = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const settings = await getSettings();
  const esaDomain = settings.esa_domain?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

  // 配置了 ESA 时，直接返回 ESA 域名URL
  // ESA 应开启"私有Bucket回源"功能，由ESA负责回源鉴权
  if (esaDomain) {
    return `https://${esaDomain}/${key}`;
  }

  // 未配置 ESA 时，使用 OSS 签名URL（私有Bucket场景）
  const client = await getOssClient();
  const signedUrl = client.signatureUrl(key, {
    method: 'GET',
    expires: 3600,
  });

  return signedUrl;
}
