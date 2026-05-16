import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getConversionTaskStatus } from '@/lib/convert-service';
import { calculateConversionPrice } from '@/lib/convert-price-calc';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await db.query(
      `SELECT fc.*, fco.price, fco.status as order_status
       FROM file_conversions fc
       LEFT JOIN file_conversion_orders fco ON fco.conversion_id = fc.id
       WHERE fc.id = $1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '转换记录不存在' }, { status: 404 });
    }

    const conversion = result.rows[0];
    const dstFormat = conversion.dst_format || 'pdf';

    if (conversion.status === 'completed') {
      const pageCount = conversion.page_count || 0;
      const price = await calculateConversionPrice({ pageCount, srcFormat: conversion.src_format, dstFormat });
      return NextResponse.json({
        status: 'completed',
        pageCount,
        price,
        dstFormat,
        paid: conversion.order_status === 'paid',
      });
    }

    if (conversion.status === 'failed') {
      return NextResponse.json({ status: 'failed' });
    }

    if (conversion.status === 'converting' && conversion.task_id) {
      try {
        const taskStatus = await getConversionTaskStatus(conversion.task_id);

        if (taskStatus.status === 'completed') {
          await db.query(
            `UPDATE file_conversions SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [conversion.id]
          );

          const price = await calculateConversionPrice({ pageCount: 0, srcFormat: conversion.src_format, dstFormat });

          return NextResponse.json({
            status: 'completed',
            pageCount: 0,
            price,
            dstFormat,
            paid: false,
          });
        }

        if (taskStatus.status === 'failed') {
          await db.query(
            `UPDATE file_conversions SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [conversion.id]
          );
          return NextResponse.json({ status: 'failed', error: taskStatus.error });
        }

        return NextResponse.json({
          status: 'converting',
          progress: taskStatus.progress,
        });
      } catch (err) {
        console.error('Get task status error:', err);
        return NextResponse.json({
          status: 'converting',
          progress: 0,
        });
      }
    }

    return NextResponse.json({ status: conversion.status });
  } catch (error) {
    console.error('Get conversion status error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}