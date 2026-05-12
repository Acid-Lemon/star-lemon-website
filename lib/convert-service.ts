import { getSettings } from './settings';

const FORMAT_MAP: Record<string, string> = {
  '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png', '.gif': 'gif',
  '.bmp': 'bmp', '.tiff': 'tiff', '.tif': 'tiff', '.webp': 'webp',
  '.doc': 'doc', '.docx': 'docx', '.dot': 'dot', '.dotx': 'dotx',
  '.rtf': 'rtf', '.odt': 'odt', '.txt': 'txt', '.wps': 'wps',
  '.xls': 'xls', '.xlsx': 'xlsx', '.xlsm': 'xlsm', '.ods': 'ods',
  '.csv': 'csv', '.et': 'et',
  '.ppt': 'ppt', '.pptx': 'pptx', '.pps': 'pps', '.ppsx': 'ppsx',
  '.odp': 'odp', '.dps': 'dps',
  '.pdf': 'pdf', '.html': 'html', '.htm': 'html',
};

export const SUPPORTED_EXTENSIONS = Object.keys(FORMAT_MAP);

export function getSrcFormat(fileName: string): string | null {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return FORMAT_MAP[ext] || null;
}

export function isFormatSupported(fileName: string): boolean {
  return getSrcFormat(fileName) !== null;
}

export function countPdfPages(buffer: Buffer): number {
  const text = buffer.toString('latin1');
  const countMatch = text.match(/\/Count\s+(\d+)/);
  if (countMatch) {
    return parseInt(countMatch[1]);
  }
  const pageMatches = text.match(/\/Type\s*\/Page(?!s)/g);
  return pageMatches ? pageMatches.length : 1;
}

async function getApiConfig() {
  const settings = await getSettings();
  return {
    apiUrl: settings.convert_api_url || 'https://gg.goldenglow.top:50006',
    apiKey: settings.convert_api_key || '',
  };
}

export async function uploadAndConvert(params: {
  fileBuffer: Buffer;
  fileName: string;
  srcFormat: string;
  dstFormat?: string;
}): Promise<{ taskId: string; filename: string; fileSize: number; status: string }> {
  const { apiUrl, apiKey } = await getApiConfig();

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(params.fileBuffer)]), params.fileName);
  formData.append('src_format', params.srcFormat);
  formData.append('dst_format', params.dstFormat || 'pdf');

  const response = await fetch(`${apiUrl}/convert_upload`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || '上传转换失败');
  }

  const data = result.data || result;
  return {
    taskId: data.task_id,
    filename: data.filename || params.fileName,
    fileSize: data.file_size || 0,
    status: data.status || 'pending',
  };
}

export async function getConversionTaskStatus(taskId: string): Promise<{
  status: string;
  progress: number;
  error?: string;
}> {
  const { apiUrl, apiKey } = await getApiConfig();

  const response = await fetch(`${apiUrl}/convert_task/${taskId}`, {
    headers: {
      'X-API-Key': apiKey,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || '查询任务状态失败');
  }

  const data = result.data || result;
  return {
    status: data.status || 'unknown',
    progress: data.progress || 0,
    error: data.error,
  };
}

export async function downloadConvertedFile(taskId: string): Promise<Buffer> {
  const { apiUrl, apiKey } = await getApiConfig();

  const response = await fetch(`${apiUrl}/convert_task/${taskId}/download`, {
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    let errorMsg = `下载转换文件失败: ${response.status}`;
    try {
      const errResult = await response.json();
      errorMsg = errResult.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
