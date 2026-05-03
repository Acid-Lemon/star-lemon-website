import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPayNotify } from '@/lib/lantu-pay';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const searchParams = new URLSearchParams(text);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('Pay notify received:', JSON.stringify(params));

    const isValid = await verifyPayNotify(params);
    if (!isValid) {
      console.error('Pay notify signature verification failed');
      return new NextResponse('FAIL', { status: 200 });
    }

    if (params.code !== '0') {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const attach = params.attach;
    if (!attach) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const transferId = parseInt(attach);
    const transfer = await db.query(
      'SELECT * FROM file_transfers WHERE id = $1 AND pay_status = $2',
      [transferId, 'unpaid']
    );

    if (transfer.rows.length === 0) {
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const paidAmount = parseFloat(params.total_fee || '0');
    const expectedAmount = parseFloat(transfer.rows[0].price);

    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error('Amount mismatch:', paidAmount, expectedAmount);
      return new NextResponse('SUCCESS', { status: 200 });
    }

    const row = transfer.rows[0];

    await db.query(
      'UPDATE file_transfers SET pay_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['paid', transferId]
    );

    const userResult = await db.query(
      'SELECT nickname, email FROM users WHERE id = $1',
      [row.user_id]
    );
    const user = userResult.rows[0] || {};

    await db.query(`
      INSERT INTO file_transfer_orders
        (transfer_id, code, file_name, file_size, max_downloads, download_count, retain_days, price, pay_order_no, user_id, user_nickname, user_email, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'paid', CURRENT_TIMESTAMP)
      ON CONFLICT (transfer_id) DO UPDATE SET
        pay_order_no = EXCLUDED.pay_order_no,
        price = EXCLUDED.price,
        status = 'paid',
        refund_amount = 0,
        deleted_at = NULL
    `, [
      row.id, row.code, row.file_name, row.file_size, row.max_downloads,
      row.download_count, row.retain_days, row.price, params.order_no || row.pay_order_no,
      row.user_id, user.nickname, user.email
    ]);

    return new NextResponse('SUCCESS', { status: 200 });
  } catch (error) {
    console.error('Pay notify error:', error);
    return new NextResponse('FAIL', { status: 200 });
  }
}
