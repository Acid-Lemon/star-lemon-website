import { deleteFile as deleteOssFile } from './oss';

export async function deleteUploadedFile(url: string | null | undefined): Promise<void> {
    if (!url) return;

    if (url.startsWith('http')) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            if (pathname.startsWith('/uploads/') || pathname.startsWith('/file-transfer/')) {
                const key = pathname.slice(1);
                await deleteOssFile(key);
            }
        } catch {
            // invalid URL, ignore
        }
        return;
    }

    // 旧本地路径不再处理，本地文件已通过脚本清理
}
