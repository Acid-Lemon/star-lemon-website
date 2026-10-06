import { NextRequest, NextResponse } from 'next/server';
import { sendToPeer } from '@/lib/p2p-transfer-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room, from, to, type, data } = body as {
      room?: string;
      from?: string;
      to?: string;
      type?: string;
      data?: unknown;
    };

    if (!room || !from || !to || !type) {
      return NextResponse.json({ error: 'Missing room, from, to, or type' }, { status: 400 });
    }

    const normalizedRoom = room.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    const payload = JSON.stringify({ type: 'signal', from, signalType: type, data });

    const sent = sendToPeer(normalizedRoom, to, payload);
    if (!sent) {
      return NextResponse.json({ error: 'Peer not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
