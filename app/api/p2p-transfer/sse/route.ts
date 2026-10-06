import { NextRequest } from 'next/server';
import { addPendingPeer, removePeer, broadcastToPeers } from '@/lib/p2p-transfer-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room')?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  const peer = req.nextUrl.searchParams.get('peer');
  const name = req.nextUrl.searchParams.get('name')?.trim().slice(0, 20);

  if (!room || !peer || !name) {
    return new Response('Missing room, peer, or name', { status: 400 });
  }

  const encoder = new TextEncoder();

  let cleanedUp = false;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let registeredSend: ((data: string) => void) | null = null;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    const removedPeer = removePeer(room, peer, registeredSend ?? undefined);
    if (removedPeer?.admitted) {
      broadcastToPeers(room, JSON.stringify({ type: 'peer-leave', peerId: peer }), peer);
    } else if (removedPeer) {
      broadcastToPeers(room, JSON.stringify({ type: 'peer-cancel', peerId: peer }), peer);
    }
    try { controller.close(); } catch { /* already closed */ }
  };
  let controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // controller already closed
        }
      };
      registeredSend = send;

      const result = addPendingPeer(room, peer, name.trim(), send);
      if (!result.ok) {
        send(JSON.stringify({ type: 'join-error', reason: result.reason }));
        queueMicrotask(cleanup);
        return;
      }

      send(JSON.stringify({ type: 'peers', peers: result.peers, connectionPeers: result.connectionPeers }));

      // Heartbeat to keep connection alive through proxies
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatTimer!);
        }
      }, 15000);

      req.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
