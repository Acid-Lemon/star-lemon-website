import { getSettings } from './settings';
import {
  CONVERSION_STATUS_TIMEOUT_MS,
  CONVERSION_UPSTREAM_TIMEOUT_MS,
} from './convert-constants';
import { createConversionMultipartBody } from './convert-upload';

export {
  SUPPORTED_EXTENSIONS,
  getSrcFormat,
  isFormatSupported,
  getFormatCategory,
  getOutputFormats,
  getOutputFormatLabel,
  isValidOutputFormat,
  isPdfOutput,
} from './convert-formats';
export type { FormatCategory } from './convert-formats';

interface ConvertApiResponse {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

async function getApiConfig() {
  const settings = await getSettings();
  return {
    apiUrl: settings.convert_api_url || 'https://gg.goldenglow.top:50006',
    apiKey: settings.convert_api_key || '',
  };
}

export async function uploadAndConvert(params: {
  fileStream: ReadableStream<Uint8Array>;
  fileSize: number;
  fileName: string;
  contentType: string;
  srcFormat: string;
  dstFormat?: string;
  signal?: AbortSignal;
}): Promise<{ taskId: string; filename: string; fileSize: number; status: string }> {
  const { apiUrl, apiKey } = await getApiConfig();
  const multipart = createConversionMultipartBody({
    fileStream: params.fileStream,
    fileSize: params.fileSize,
    fileName: params.fileName,
    contentType: params.contentType,
    srcFormat: params.srcFormat,
    dstFormat: params.dstFormat || 'pdf',
  });
  const signals = [AbortSignal.timeout(CONVERSION_UPSTREAM_TIMEOUT_MS)];
  if (params.signal) signals.push(params.signal);
  const request = new Request(`${apiUrl}/convert_upload`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': multipart.contentType,
      'Content-Length': String(multipart.contentLength),
    },
    body: multipart.body,
    signal: AbortSignal.any(signals),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
  const response = await fetch(request);
  const result = await readJsonResponse(response, '上传转换失败');

  if (!response.ok || !result.success) {
    throw new Error(result.message || '上传转换失败');
  }

  const data = result.data || result;
  if (typeof data.task_id !== 'string' || !data.task_id) {
    throw new Error('转换服务未返回任务编号');
  }
  return {
    taskId: data.task_id,
    filename: typeof data.filename === 'string' ? data.filename : params.fileName,
    fileSize: typeof data.file_size === 'number' ? data.file_size : 0,
    status: typeof data.status === 'string' ? data.status : 'pending',
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
    signal: AbortSignal.timeout(CONVERSION_STATUS_TIMEOUT_MS),
  });
  const result = await readJsonResponse(response, '查询任务状态失败');

  if (!response.ok || !result.success) {
    throw new Error(result.message || '查询任务状态失败');
  }

  const data = result.data || result;
  return {
    status: typeof data.status === 'string' ? data.status : 'unknown',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    error: typeof data.error === 'string' ? data.error : undefined,
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

async function readJsonResponse(response: Response, fallbackMessage: string): Promise<ConvertApiResponse> {
  const text = await response.text();
  let result: ConvertApiResponse;
  try {
    result = JSON.parse(text) as ConvertApiResponse;
  } catch {
    const detail = text.trim().slice(0, 200);
    throw new Error(detail || `${fallbackMessage}: HTTP ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(typeof result.message === 'string' ? result.message : `${fallbackMessage}: HTTP ${response.status}`);
  }
  return result;
}
