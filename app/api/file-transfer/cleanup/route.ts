import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { deleteFile } from '@/lib/oss';

export async function POST() {
  try {
    const expired = await db.query(
      "SELECT * FROM file_transfers WHERE expire_at < NOW() AND pay_status = 'paid'"
    );

    let deleted = 0;
    for (const row of expired.rows) {
      await deleteFile(row.file_key);
      await db.query('DELETE FROM file_transfers WHERE id = $1', [row.id]);
      deleted++;
    }

    const unpaidExpired = await db.query(
      "SELECT * FROM file_transfers WHERE expire_at < NOW() AND pay_status = 'unpaid'"
    );
    for (const row of unpaidExpired.rows) {
      await deleteFile(row.file_key);
      await db.query('DELETE FROM file_transfers WHERE id = $1', [row.id]);
      deleted++;
    }

    return NextResponse.json({ deleted });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: '清理失败' }, { status: 500 });
  }
}
