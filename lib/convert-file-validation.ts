const SIGNATURES: Partial<Record<string, number[][]>> = {
  jpg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  bmp: [[0x42, 0x4d]],
  tiff: [[0x49, 0x49, 0x2a, 0x00], [0x4d, 0x4d, 0x00, 0x2a]],
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  rtf: [[0x7b, 0x5c, 0x72, 0x74, 0x66]],
};

const ZIP_FORMATS = new Set([
  'docx', 'dotx', 'xlsx', 'xlsm', 'xltx', 'xltm', 'pptx', 'ppsx', 'potx',
  'odt', 'ods', 'odp', 'epub',
]);
const OLE_FORMATS = new Set(['doc', 'dot', 'xls', 'xlt', 'ppt', 'pps', 'pot', 'wps', 'et', 'dps']);
const ZIP_SIGNATURES = [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]];
const OLE_SIGNATURE = [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]];

function matchesAny(bytes: Uint8Array, signatures: number[][]): boolean {
  return signatures.some(signature =>
    bytes.byteLength >= signature.length && signature.every((byte, index) => bytes[index] === byte)
  );
}

export function isConversionFileHeaderValid(srcFormat: string, bytes: Uint8Array): boolean {
  if (srcFormat === 'webp') {
    return bytes.byteLength >= 12
      && matchesAny(bytes, [[0x52, 0x49, 0x46, 0x46]])
      && matchesAny(bytes.subarray(8), [[0x57, 0x45, 0x42, 0x50]]);
  }
  if (ZIP_FORMATS.has(srcFormat)) return matchesAny(bytes, ZIP_SIGNATURES);
  if (OLE_FORMATS.has(srcFormat)) return matchesAny(bytes, OLE_SIGNATURE);
  const signatures = SIGNATURES[srcFormat];
  return signatures ? matchesAny(bytes, signatures) : true;
}

export async function readStreamHeader(stream: ReadableStream<Uint8Array>, maxBytes = 16): Promise<Uint8Array> {
  const reader = stream.getReader();
  const header = new Uint8Array(maxBytes);
  let length = 0;

  try {
    while (length < maxBytes) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const bytesToCopy = Math.min(chunk.value.byteLength, maxBytes - length);
      header.set(chunk.value.subarray(0, bytesToCopy), length);
      length += bytesToCopy;
    }
  } finally {
    void reader.cancel();
  }

  return header.subarray(0, length);
}
