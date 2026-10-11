import db from '@/lib/db';
import { deleteFile, getTransferObjectKey } from '@/lib/oss';

const BATCH_LIMIT = 100;
// 下载次数用尽后的宽限期：签发的下载 URL 有效期 300 秒，宽限 1 小时
// 保证最后一次下载有充足时间完成，之后才删除记录与 OSS 对象
const DOWNLOAD_GRACE_SECONDS = 3600;
// advisory lock 标识，任意固定整数（pg 会转为 bigint），专用于文件快传清理任务
const CLEANUP_ADVISORY_LOCK_KEY = 7283615421;

export interface CleanupResult {
  deleted: number;
  failed: number;
}

/**
 * 清理已过期的文件快传记录：
 * 先删 OSS 对象，删除成功后才删数据库行；删除失败则保留行，等待下次重试。
 * file_key 为空（支付后上传了文件但未确认）的记录，按确定性 key 兜底删除。
 *
 * 并发防护：advisory lock 是 PostgreSQL 会话级锁，必须全程使用同一个连接
 * 加锁、执行、解锁；锁被其他实例持有时本轮直接跳过。
 */
export async function cleanupExpiredFileTransfers(): Promise<CleanupResult> {
  const client = await db.pool.connect();

  try {
    const lockResult = await client.query('SELECT pg_try_advisory_lock($1) AS locked', [CLEANUP_ADVISORY_LOCK_KEY]);
    if (!lockResult.rows[0]?.locked) {
      return { deleted: 0, failed: 0 };
    }

    let deleted = 0;
    let failed = 0;

    try {
      let progressed = true;
      while (progressed) {
        const result = await client.query(
          `SELECT id, file_name, file_key
           FROM file_transfers
           WHERE expire_at < NOW()
              OR (download_count >= max_downloads
                  AND updated_at < NOW() - INTERVAL '${DOWNLOAD_GRACE_SECONDS} seconds')
           ORDER BY id
           LIMIT $1`,
          [BATCH_LIMIT]
        );
        const expired: { id: number; file_name: string; file_key: string | null }[] = result.rows;
        if (expired.length === 0) break;

        progressed = false;
        for (const row of expired) {
          const key = row.file_key?.trim() || getTransferObjectKey(row.id, row.file_name);
          try {
            await deleteFile(key);
            await client.query('DELETE FROM file_transfers WHERE id = $1', [row.id]);
            deleted++;
            progressed = true; // 本批有行被成功清理，继续处理下一批
          } catch (error) {
            failed++;
            console.error(`[file-transfer-cleanup] 删除 OSS 对象失败，保留记录待重试 (id=${row.id}, key=${key}):`, error);
          }
        }
      }
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [CLEANUP_ADVISORY_LOCK_KEY]).catch(() => {});
    }

    return { deleted, failed };
  } finally {
    client.release();
  }
}
