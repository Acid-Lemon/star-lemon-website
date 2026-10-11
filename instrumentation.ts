/**
 * Next.js 服务器启动钩子：每个服务器实例启动时调用一次。
 * 在 Node.js runtime 下启动文件快传过期清理定时器，
 * 使 cleanup 不依赖任何外部 cron 程序——进程重启后定时器自动重建。
 * 定时器 unref，不阻塞进程退出；多实例并发由 PostgreSQL advisory lock 防护。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { cleanupExpiredFileTransfers } = await import('@/lib/file-transfer-cleanup');

  const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 每 10 分钟
  const INITIAL_DELAY_MS = 30 * 1000; // 启动后 30 秒先跑一轮，清理上次停机期间过期的文件

  const runCleanup = () => {
    cleanupExpiredFileTransfers()
      .then(({ deleted, failed }) => {
        if (deleted > 0 || failed > 0) {
          console.log(`[file-transfer-cleanup] 本轮完成：删除 ${deleted} 条记录，${failed} 条删除失败待重试`);
        }
      })
      .catch((error) => {
        console.error('[file-transfer-cleanup] 清理执行失败：', error);
      });
  };

  const initialTimer = setTimeout(() => {
    runCleanup();
    const interval = setInterval(runCleanup, CLEANUP_INTERVAL_MS);
    interval.unref?.();
  }, INITIAL_DELAY_MS);
  initialTimer.unref?.();
}
