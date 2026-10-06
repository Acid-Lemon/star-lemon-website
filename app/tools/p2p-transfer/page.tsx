import type { Metadata } from 'next';
import P2PTransferClient from './p2p-transfer-client';

export const metadata: Metadata = {
  title: 'P2P互传',
  description: '通过 WebRTC 进行实时聊天与点对点文件传输',
};

function randomRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export default async function P2PTransferPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room } = await searchParams;
  const initialRoom = room?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || randomRoomCode();
  return <P2PTransferClient initialRoom={initialRoom} />;
}
