type Peer = {
  id: string;
  name: string;
  send: (data: string) => void;
  admitted: boolean;
};

const rooms = new Map<string, Map<string, Peer>>();

function getRoom(roomCode: string) {
  let room = rooms.get(roomCode);
  if (!room) {
    room = new Map();
    rooms.set(roomCode, room);
  }
  return room;
}

export function addPendingPeer(roomCode: string, peerId: string, name: string, send: (data: string) => void) {
  const room = getRoom(roomCode);
  const currentPeer = room.get(peerId);
  const normalizedName = name.trim().toLocaleLowerCase();
  const hasNameConflict = Array.from(room.values()).some(
    (peer) => peer.id !== peerId && peer.name.trim().toLocaleLowerCase() === normalizedName,
  );

  if (hasNameConflict) {
    return { ok: false as const, reason: 'name-conflict' as const };
  }

  const existingPeers = Array.from(room.values()).filter((peer) => peer.id !== peerId);
  const peers = existingPeers
    .filter((peer) => peer.admitted)
    .map((peer) => ({ id: peer.id, name: peer.name }));
  const connectionPeers = existingPeers.map((peer) => ({ id: peer.id, name: peer.name }));
  room.set(peerId, { id: peerId, name, send, admitted: currentPeer?.admitted ?? false });
  return { ok: true as const, peers, connectionPeers };
}

export function admitPeer(roomCode: string, peerId: string) {
  const peer = rooms.get(roomCode)?.get(peerId);
  if (!peer || peer.admitted) return null;
  peer.admitted = true;
  return { id: peer.id, name: peer.name };
}

export function removePeer(roomCode: string, peerId: string, send?: (data: string) => void) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  const peer = room.get(peerId);
  if (!peer || (send && peer.send !== send)) return null;
  room.delete(peerId);
  if (room.size === 0) rooms.delete(roomCode);
  return { id: peer.id, name: peer.name, admitted: peer.admitted };
}

export function sendToPeer(roomCode: string, peerId: string, data: string) {
  const room = rooms.get(roomCode);
  if (!room) return false;
  const peer = room.get(peerId);
  if (!peer) return false;
  peer.send(data);
  return true;
}

export function broadcastToPeers(roomCode: string, data: string, excludePeerId?: string) {
  const room = rooms.get(roomCode);
  if (!room) return;
  for (const [id, peer] of room) {
    if (id !== excludePeerId) peer.send(data);
  }
}
