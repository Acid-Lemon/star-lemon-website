import OSS from 'ali-oss';
import { getSettings } from './settings';

let ossClient: InstanceType<typeof OSS> | null = null;

export async function getOssClient() {
  if (ossClient) return ossClient;

  const settings = await getSettings();

  ossClient = new OSS({
    endpoint: settings.oss_endpoint || '',
    accessKeyId: settings.oss_access_key_id || '',
    accessKeySecret: settings.oss_access_key_secret || '',
    bucket: settings.oss_bucket || '',
    region: settings.oss_region || 'oss-cn-hangzhou',
    secure: true,
  });

  return ossClient;
}

export async function generateUploadCredentials(fileName: string) {
  const settings = await getSettings();
  const client = await getOssClient();
  const key = `file-transfer/${Date.now()}-${Math.random().toString(36).substring(2, 8)}/${fileName}`;

  const credentials = client.signatureUrl(key, {
    method: 'PUT',
    expires: 3600,
    'Content-Type': 'application/octet-stream',
  });

  return { key, uploadUrl: credentials, bucket: settings.oss_bucket || '' };
}

export async function generateDownloadUrl(key: string, fileName: string): Promise<string> {
  const settings = await getSettings();
  const esaDomain = settings.esa_domain;

  if (esaDomain) {
    return `https://${esaDomain}/${key}`;
  }

  const client = await getOssClient();
  const signedUrl = client.signatureUrl(key, {
    method: 'GET',
    expires: 300,
    response: {
      'content-disposition': `attachment; filename="${fileName}"`,
    },
  });

  return signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const client = await getOssClient();
    await client.delete(key);
  } catch (error: any) {
    if (error?.code !== 'NoSuchKey') {
      console.error('Failed to delete OSS file:', key, error?.message);
    }
  }
}

export function resetOssClient() {
  ossClient = null;
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
  const esaDomain = settings.esa_domain;

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
