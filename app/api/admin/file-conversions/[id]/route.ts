import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { deleteFile } from '@/lib/oss';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const { id } = await params;

    const result = await db.query(
      `SELECT fc.*, fco.status as order_status
       FROM file_conversions fc
       LEFT JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
       WHERE fc.id = $1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    const conversion = result.rows[0];

    if (conversion.src_oss_key) {
      await deleteFile(conversion.src_oss_key).catch(() => {});
    }
    if (conversion.pdf_oss_key && conversion.pdf_oss_key !== conversion.src_oss_key) {
      await deleteFile(conversion.pdf_oss_key).catch(() => {});
    }

    await db.query('DELETE FROM file_conversions WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true, message: '已删除' });
  } catch (error) {
    console.error('Delete file conversion error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
