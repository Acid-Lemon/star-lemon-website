import { NextRequest, NextResponse } from 'next/server';
import { admitPeer, broadcastToPeers } from '@/lib/p2p-transfer-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { room?: string; peer?: string };
    if (!body.room || !body.peer) {
      return NextResponse.json({ error: 'Missing room or peer' }, { status: 400 });
    }

    const room = body.room.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    const peer = admitPeer(room, body.peer);
    if (!peer) {
      return NextResponse.json({ error: 'Pending peer not found' }, { status: 409 });
    }

    broadcastToPeers(room, JSON.stringify({ type: 'peer-join', peer }), body.peer);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
