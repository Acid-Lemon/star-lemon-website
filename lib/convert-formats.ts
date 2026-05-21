const FORMAT_MAP: Record<string, string> = {
  '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png', '.gif': 'gif',
  '.bmp': 'bmp', '.tiff': 'tiff', '.tif': 'tiff', '.webp': 'webp',
  '.doc': 'doc', '.docx': 'docx', '.dot': 'dot', '.dotx': 'dotx',
  '.rtf': 'rtf', '.odt': 'odt', '.txt': 'txt', '.wps': 'wps',
  '.fodt': 'fodt', '.epub': 'epub', '.xml': 'xml', '.md': 'md',
  '.pdf': 'pdf', '.html': 'html', '.htm': 'html',
  '.xls': 'xls', '.xlsx': 'xlsx', '.xlsm': 'xlsm', '.xlt': 'xlt',
  '.xltx': 'xltx', '.xltm': 'xltm', '.ods': 'ods', '.csv': 'csv',
  '.et': 'et', '.fods': 'fods', '.dbf': 'dbf',
  '.ppt': 'ppt', '.pptx': 'pptx', '.pps': 'pps', '.ppsx': 'ppsx',
  '.pot': 'pot', '.potx': 'potx', '.odp': 'odp', '.dps': 'dps',
  '.fodp': 'fodp',
};

export const SUPPORTED_EXTENSIONS = Object.keys(FORMAT_MAP);

export function getSrcFormat(fileName: string): string | null {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return FORMAT_MAP[ext] || null;
}

export function isFormatSupported(fileName: string): boolean {
  return getSrcFormat(fileName) !== null;
}

export type FormatCategory = 'document' | 'spreadsheet' | 'presentation' | 'image';

const FORMAT_CATEGORY: Record<string, FormatCategory> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', tiff: 'image', webp: 'image',
  doc: 'document', docx: 'document', dot: 'document', dotx: 'document', rtf: 'document',
  odt: 'document', txt: 'document', wps: 'document', fodt: 'document', epub: 'document',
  xml: 'document', md: 'document', pdf: 'document', html: 'document', htm: 'document',
  xls: 'spreadsheet', xlsx: 'spreadsheet', xlsm: 'spreadsheet', xlt: 'spreadsheet',
  xltx: 'spreadsheet', xltm: 'spreadsheet', ods: 'spreadsheet', csv: 'spreadsheet',
  et: 'spreadsheet', fods: 'spreadsheet', dbf: 'spreadsheet',
  ppt: 'presentation', pptx: 'presentation', pps: 'presentation', ppsx: 'presentation',
  pot: 'presentation', potx: 'presentation', odp: 'presentation', dps: 'presentation',
  fodp: 'presentation',
};

export function getFormatCategory(srcFormat: string): FormatCategory | null {
  return FORMAT_CATEGORY[srcFormat.toLowerCase()] || null;
}

const CATEGORY_OUTPUT_FORMATS: Record<FormatCategory, string[]> = {
  document: ['pdf', 'html', 'txt', 'docx', 'rtf', 'odt', 'epub', 'md', 'png', 'jpg', 'bmp', 'tiff', 'gif', 'webp', 'svg'],
  spreadsheet: ['pdf', 'html', 'csv', 'xlsx', 'ods', 'png', 'jpg'],
  presentation: ['pdf', 'pptx', 'odp', 'png', 'jpg', 'bmp', 'tiff', 'gif', 'svg'],
  image: ['pdf', 'png', 'jpg', 'gif', 'bmp', 'tiff'],
};

const OUTPUT_FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF', docx: 'Word', xlsx: 'Excel', pptx: 'PPT', odp: 'ODP',
  html: 'HTML', md: 'Markdown', txt: '纯文本', rtf: 'RTF', odt: 'ODT',
  epub: 'EPUB', csv: 'CSV', ods: 'ODS',
  png: 'PNG', jpg: 'JPG', gif: 'GIF', bmp: 'BMP', tiff: 'TIFF', webp: 'WebP', svg: 'SVG',
};

export function getOutputFormats(srcFormat: string): string[] {
  const category = getFormatCategory(srcFormat);
  return category ? CATEGORY_OUTPUT_FORMATS[category] : [];
}

export function getOutputFormatLabel(format: string): string {
  return OUTPUT_FORMAT_LABELS[format] || format.toUpperCase();
}

export function isValidOutputFormat(srcFormat: string, dstFormat: string): boolean {
  const formats = getOutputFormats(srcFormat);
  return formats.includes(dstFormat.toLowerCase());
}

export function isPdfOutput(dstFormat?: string): boolean {
  return !dstFormat || dstFormat.toLowerCase() === 'pdf';
}