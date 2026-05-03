import OSS from 'ali-oss';
import { getSettings } from './settings';

let ossClient: InstanceType<typeof OSS> | null = null;

async function getOssClient() {
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
  const client = await getOssClient();

  const signedUrl = client.signatureUrl(key, {
    method: 'GET',
    expires: 300,
    response: {
      'content-disposition': `attachment; filename="${fileName}"`,
    },
  });

  if (esaDomain) {
    const urlObj = new URL(signedUrl);
    const search = urlObj.search;
    return `https://${esaDomain}/${key}${search}`;
  }

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
