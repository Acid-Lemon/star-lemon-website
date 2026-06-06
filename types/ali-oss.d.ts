declare module 'ali-oss' {
  interface OSSOptions {
    endpoint?: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region?: string;
    secure?: boolean;
    [key: string]: unknown;
  }

  interface SignatureUrlOptions {
    method?: string;
    expires?: number;
    'Content-Type'?: string;
    response?: {
      [key: string]: string;
    };
    [key: string]: unknown;
  }

  interface PutResult {
    name: string;
    url?: string;
    res: {
      status: number;
      headers: Record<string, string>;
    };
  }

  class OSS {
    constructor(options: OSSOptions);
    put(key: string, buffer: Buffer): Promise<PutResult>;
    multipartUpload(key: string, file: string, options?: { progress?: (pct: number) => void | Promise<void>; [key: string]: unknown }): Promise<{ name?: string }>;
    delete(key: string): Promise<unknown>;
    signatureUrl(key: string, options?: SignatureUrlOptions): string;
  }

  export default OSS;
}
