declare module 'ali-oss' {
  interface OSSOptions {
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region?: string;
    secure?: boolean;
    [key: string]: any;
  }

  interface SignatureUrlOptions {
    method?: string;
    expires?: number;
    'Content-Type'?: string;
    response?: {
      [key: string]: string;
    };
    [key: string]: any;
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
    delete(key: string): Promise<any>;
    signatureUrl(key: string, options?: SignatureUrlOptions): string;
  }

  export default OSS;
}
