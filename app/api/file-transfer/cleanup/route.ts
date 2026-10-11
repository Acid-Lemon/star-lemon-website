import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredFileTransfers } from '@/lib/file-transfer-cleanup';
import { getSetting } from '@/lib/settings';

export async function POST(request: NextRequest) {
  try {
    // 端点无登录态，用后台配置的密钥保护；未配置密钥时仅允许本机进程调用
    const secret = await getSetting('cleanup_cron_secret');
    if (secret) {
      const provided = request.headers.get('x-cleanup-secret');
      if (provided !== secret) {
        return NextResponse.json({ error: '无权限' }, { status: 401 });
      }
    } else if (!isLocalRequest(request)) {
      return NextResponse.json({ error: '请先在后台配置 cleanup_cron_secret' }, { status: 401 });
    }

    return NextResponse.json(await cleanupExpiredFileTransfers());
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: '清理失败' }, { status: 500 });
  }
}

function isLocalRequest(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];
  const hostname = host.split(':')[0];
  return localHosts.includes(hostname);
}
