const encoder = new TextEncoder();

function safeHeaderValue(value: string): string {
  return value.replace(/[\r\n"]/g, '_');
}

export function createConversionMultipartBody(params: {
  fileStream: ReadableStream<Uint8Array>;
  fileSize: number;
  fileName: string;
  contentType: string;
  srcFormat: string;
  dstFormat: string;
}): { body: ReadableStream<Uint8Array>; contentType: string; contentLength: number } {
  const boundary = `----star-lemon-${crypto.randomUUID()}`;
  const fileName = safeHeaderValue(params.fileName);
  const contentType = safeHeaderValue(params.contentType) || 'application/octet-stream';
  const prefix = encoder.encode(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: ${contentType}\r\n\r\n`
  );
  const suffix = encoder.encode(
    `\r\n--${boundary}\r\n` +
    'Content-Disposition: form-data; name="src_format"\r\n\r\n' +
    `${params.srcFormat}\r\n` +
    `--${boundary}\r\n` +
    'Content-Disposition: form-data; name="dst_format"\r\n\r\n' +
    `${params.dstFormat}\r\n` +
    `--${boundary}--\r\n`
  );
  const reader = params.fileStream.getReader();
  let phase: 'prefix' | 'file' | 'suffix' | 'done' = 'prefix';
  let received = 0;

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (phase === 'prefix') {
        phase = 'file';
        controller.enqueue(prefix);
        return;
      }
      if (phase === 'file') {
        const chunk = await reader.read();
        if (!chunk.done) {
          received += chunk.value.byteLength;
          if (received > params.fileSize) {
            await reader.cancel('File is larger than declared');
            controller.error(new Error('上传文件大小与记录不一致'));
            return;
          }
          controller.enqueue(chunk.value);
          return;
        }
        if (received !== params.fileSize) {
          controller.error(new Error('上传文件大小与记录不一致'));
          return;
        }
        phase = 'suffix';
      }
      if (phase === 'suffix') {
        phase = 'done';
        controller.enqueue(suffix);
        return;
      }
      controller.close();
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });

  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
    contentLength: prefix.byteLength + params.fileSize + suffix.byteLength,
  };
}
