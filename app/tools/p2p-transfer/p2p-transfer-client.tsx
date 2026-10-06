'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  RiArrowLeftLine,
  RiAttachment2,
  RiCheckboxCircleLine,
  RiDownloadLine,
  RiFileLine,
  RiLink,
  RiLoader4Line,
  RiRadarLine,
  RiErrorWarningLine,
  RiSendPlane2Line,
  RiUser3Line,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ChatMessage = {
  id: string;
  peerId: string;
  sender: string;
  text: string;
  time: number;
  own?: boolean;
};

type Peer = { id: string; name: string };

type Transfer = {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  direction: 'send' | 'receive';
  status: 'transferring' | 'done' | 'error';
  peerName: string;
  url?: string;
};

type FileMetadata = { id: string; name: string; size: number; type: string; sender: string };

type SseMessage =
  | { type: 'peers'; peers: Peer[]; connectionPeers: Peer[] }
  | { type: 'peer-join'; peer: Peer }
  | { type: 'peer-leave'; peerId: string }
  | { type: 'peer-cancel'; peerId: string }
  | { type: 'join-error'; reason: 'name-conflict' }
  | { type: 'signal'; from: string; signalType: string; data: unknown };

type DataChannelMessage =
  | { kind: 'chat'; id: string; sender: string; text: string; time: number }
  | { kind: 'file-meta'; id: string; name: string; size: number; mimeType: string; sender: string }
  | { kind: 'file-end'; id: string };

const MAX_FILE_SIZE = 1024 * 1024 * 1024;
const FILE_ID_LENGTH = 36;
// Keep the complete DataChannel message within 16 KiB for cross-browser SCTP compatibility.
const CHUNK_SIZE = 16 * 1024 - FILE_ID_LENGTH;
const BUFFER_THRESHOLD = 1024 * 1024;
const ADMISSION_TIMEOUT = 12_000;
const NICKNAME_STORAGE_KEY = 'p2p-transfer-nickname';

type JoinPhase = 'idle' | 'checking' | 'connecting' | 'joined';
type JoinError = { title: string; description: string };

async function checkWebRtcSupport() {
  if (!window.RTCPeerConnection) throw new Error('WebRTC is unavailable');

  const first = new RTCPeerConnection({ iceServers: [] });
  const second = new RTCPeerConnection({ iceServers: [] });
  const firstCandidates: RTCIceCandidateInit[] = [];
  const secondCandidates: RTCIceCandidateInit[] = [];
  let secondReady = false;
  let firstReady = false;

  try {
    await new Promise<void>(async (resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('WebRTC self-test timed out')), 5_000);
      const finish = (callback: () => void) => {
        window.clearTimeout(timer);
        callback();
      };

      first.onicecandidate = (event) => {
        if (!event.candidate) return;
        if (secondReady) void second.addIceCandidate(event.candidate).catch(() => finish(() => reject(new Error('ICE failed'))));
        else firstCandidates.push(event.candidate.toJSON());
      };
      second.onicecandidate = (event) => {
        if (!event.candidate) return;
        if (firstReady) void first.addIceCandidate(event.candidate).catch(() => finish(() => reject(new Error('ICE failed'))));
        else secondCandidates.push(event.candidate.toJSON());
      };
      second.ondatachannel = (event) => {
        event.channel.onopen = () => finish(resolve);
      };

      try {
        first.createDataChannel('p2p-transfer-check');
        const offer = await first.createOffer();
        await first.setLocalDescription(offer);
        await second.setRemoteDescription(offer);
        secondReady = true;
        for (const candidate of firstCandidates) await second.addIceCandidate(candidate);

        const answer = await second.createAnswer();
        await second.setLocalDescription(answer);
        await first.setRemoteDescription(answer);
        firstReady = true;
        for (const candidate of secondCandidates) await first.addIceCandidate(candidate);
      } catch (error) {
        finish(() => reject(error));
      }
    });
  } finally {
    first.close();
    second.close();
  }
}

function randomRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function shortId(value: string) {
  return value.slice(0, 6).toUpperCase();
}

// Binary framing: [36 bytes file ID (ASCII, null-padded)][rest: chunk data]
function packChunk(fileId: string, data: ArrayBuffer): ArrayBuffer {
  const encoder = new TextEncoder();
  const idBytes = encoder.encode(fileId);
  const result = new Uint8Array(FILE_ID_LENGTH + data.byteLength);
  for (let i = 0; i < FILE_ID_LENGTH; i++) {
    result[i] = i < idBytes.length ? idBytes[i] : 0;
  }
  result.set(new Uint8Array(data), FILE_ID_LENGTH);
  return result.buffer;
}

function unpackChunk(buffer: ArrayBuffer): { fileId: string; data: ArrayBuffer } {
  const idBytes = new Uint8Array(buffer, 0, FILE_ID_LENGTH);
  const decoder = new TextDecoder();
  const fileId = decoder.decode(idBytes).replace(/\0+$/, '');
  const data = buffer.slice(FILE_ID_LENGTH);
  return { fileId, data };
}

export default function P2PTransferClient({ initialRoom }: { initialRoom: string }) {
  const [roomCode, setRoomCode] = useState(initialRoom);
  const [joinedRoom, setJoinedRoom] = useState('');
  const [joinPhase, setJoinPhase] = useState<JoinPhase>('idle');
  const [joinError, setJoinError] = useState<JoinError | null>(null);
  const [nickname, setNickname] = useState('访客');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [draft, setDraft] = useState('');
  const [dragging, setDragging] = useState(false);
  const [connStatus, setConnStatus] = useState<Record<string, 'connecting' | 'connected' | 'failed'>>({});

  const selfIdRef = useRef(crypto.randomUUID());
  const eventSourceRef = useRef<EventSource | null>(null);
  const peersRef = useRef<Peer[]>([]);
  const nicknameRef = useRef(nickname);
  const joinedRoomRef = useRef('');
  const downloadUrlsRef = useRef<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receivingFilesRef = useRef<Map<string, { meta: FileMetadata; chunks: ArrayBuffer[]; received: number }>>(new Map());
  const connectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const expectedPeerIdsRef = useRef<Set<string>>(new Set());
  const admissionTimerRef = useRef<number | null>(null);
  const admissionStartedRef = useRef(false);
  const joinPhaseRef = useRef<JoinPhase>('idle');
  const tryAdmitRef = useRef<() => Promise<void>>(async () => undefined);
  const failJoinRef = useRef<(error: JoinError) => void>(() => undefined);

  useEffect(() => { peersRef.current = peers; }, [peers]);
  useEffect(() => { nicknameRef.current = nickname; }, [nickname]);
  useEffect(() => { joinedRoomRef.current = joinedRoom; }, [joinedRoom]);
  useEffect(() => { joinPhaseRef.current = joinPhase; }, [joinPhase]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    try {
      const savedNickname = window.localStorage.getItem(NICKNAME_STORAGE_KEY)?.trim().slice(0, 20);
      if (savedNickname) setNickname(savedNickname);
    } catch { /* localStorage may be unavailable */ }
  }, []);

  const peerName = useCallback((peerId: string) => (
    peersRef.current.find((peer) => peer.id === peerId)?.name || `设备-${shortId(peerId)}`
  ), []);

  // --- DataChannel message handlers ---

  const handleDataChannelMessage = useCallback((peerId: string, msg: DataChannelMessage) => {
    if (msg.kind === 'chat') {
      setMessages((current) => {
        if (current.some((m) => m.id === msg.id)) return current;
        return [...current, { id: msg.id, peerId, sender: msg.sender, text: msg.text, time: msg.time }];
      });
    } else if (msg.kind === 'file-meta') {
      const meta: FileMetadata = { id: msg.id, name: msg.name, size: msg.size, type: msg.mimeType, sender: msg.sender };
      receivingFilesRef.current.set(meta.id, { meta, chunks: [], received: 0 });
      setTransfers((current) => [{ ...meta, progress: 0, direction: 'receive', status: 'transferring', peerName: msg.sender || peerName(peerId) }, ...current]);
    } else if (msg.kind === 'file-end') {
      const receiving = receivingFilesRef.current.get(msg.id);
      if (receiving) {
        if (receiving.received < receiving.meta.size) {
          setTransfers((current) => current.map((t) => t.id === msg.id ? { ...t, status: 'error' } : t));
          toast.error(`${receiving.meta.name} 传输不完整`);
          receivingFilesRef.current.delete(msg.id);
          return;
        }
        const blob = new Blob(receiving.chunks, { type: receiving.meta.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        downloadUrlsRef.current.push(url);
        setTransfers((current) => current.map((t) => t.id === msg.id ? { ...t, progress: 1, status: 'done', url } : t));
        receivingFilesRef.current.delete(msg.id);
        toast.success(`已收到 ${receiving.meta.name}`);
      }
    }
  }, [peerName]);

  const handleBinaryChunk = useCallback((fileId: string, data: ArrayBuffer) => {
    const receiving = receivingFilesRef.current.get(fileId);
    if (receiving) {
      receiving.chunks.push(data);
      receiving.received += data.byteLength;
      const progress = receiving.meta.size > 0 ? Math.min(receiving.received / receiving.meta.size, 1) : 1;
      setTransfers((current) => current.map((t) => t.id === fileId ? { ...t, progress } : t));
    }
  }, []);

  // --- WebRTC connection management ---

  const setupDataChannel = useCallback((channel: RTCDataChannel, peerId: string) => {
    channel.binaryType = 'arraybuffer';
    channel.bufferedAmountLowThreshold = BUFFER_THRESHOLD;

    channel.onopen = () => {
      dataChannelsRef.current.set(peerId, channel);
      setConnStatus((prev) => ({ ...prev, [peerId]: 'connected' }));
      void tryAdmitRef.current();
    };

    channel.onclose = () => {
      dataChannelsRef.current.delete(peerId);
    };

    channel.onerror = () => {
      dataChannelsRef.current.delete(peerId);
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data) as DataChannelMessage;
          handleDataChannelMessage(peerId, msg);
        } catch { /* ignore parse errors */ }
      } else {
        const { fileId, data } = unpackChunk(event.data);
        handleBinaryChunk(fileId, data);
      }
    };
  }, [handleDataChannelMessage, handleBinaryChunk]);

  const sendSignal = useCallback(async (to: string, signalType: string, data: unknown) => {
    try {
      await fetch('/api/p2p-transfer/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: joinedRoomRef.current, from: selfIdRef.current, to, type: signalType, data }),
      });
    } catch { /* network error */ }
  }, []);

  const createConnection = useCallback(async (peerId: string) => {
    if (connectionsRef.current.has(peerId)) return;

    const pc = new RTCPeerConnection({ iceServers: [] });
    connectionsRef.current.set(peerId, pc);
    setConnStatus((prev) => ({ ...prev, [peerId]: 'connecting' }));

    const channel = pc.createDataChannel('p2p-transfer', { ordered: true });
    setupDataChannel(channel, peerId);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        void sendSignal(peerId, 'ice-candidate', event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        dataChannelsRef.current.delete(peerId);
        if (state === 'failed') {
          setConnStatus((prev) => ({ ...prev, [peerId]: 'failed' }));
          if (joinPhaseRef.current === 'connecting' && expectedPeerIdsRef.current.has(peerId)) {
            failJoinRef.current({
              title: '无法建立点对点连接',
              description: '当前设备或网络环境不支持 WebRTC P2P 直连，因此未加入房间。',
            });
          }
        }
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendSignal(peerId, 'offer', offer);
  }, [sendSignal, setupDataChannel]);

  const handleSignal = useCallback(async (from: string, signalType: string, data: unknown) => {
    if (signalType === 'offer') {
      const offer = data as RTCSessionDescriptionInit;
      let pc = connectionsRef.current.get(from);
      if (!pc) {
        pc = new RTCPeerConnection({ iceServers: [] });
        connectionsRef.current.set(from, pc);
        setConnStatus((prev) => ({ ...prev, [from]: 'connecting' }));

        pc.ondatachannel = (event) => {
          setupDataChannel(event.channel, from);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            void sendSignal(from, 'ice-candidate', event.candidate.toJSON());
          }
        };

        pc.onconnectionstatechange = () => {
          const state = pc!.connectionState;
          if (state === 'failed' || state === 'closed' || state === 'disconnected') {
            dataChannelsRef.current.delete(from);
            if (state === 'failed') {
              setConnStatus((prev) => ({ ...prev, [from]: 'failed' }));
              if (joinPhaseRef.current === 'connecting' && expectedPeerIdsRef.current.has(from)) {
                failJoinRef.current({
                  title: '无法建立点对点连接',
                  description: '当前设备或网络环境不支持 WebRTC P2P 直连，因此未加入房间。',
                });
              }
            }
          }
        };
      }

      await pc.setRemoteDescription(offer);

      // Process buffered ICE candidates
      const pending = pendingCandidatesRef.current.get(from) || [];
      for (const candidate of pending) {
        try { await pc.addIceCandidate(candidate); } catch { /* ignore */ }
      }
      pendingCandidatesRef.current.delete(from);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal(from, 'answer', answer);
    } else if (signalType === 'answer') {
      const answer = data as RTCSessionDescriptionInit;
      const pc = connectionsRef.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(answer);

        const pending = pendingCandidatesRef.current.get(from) || [];
        for (const candidate of pending) {
          try { await pc.addIceCandidate(candidate); } catch { /* ignore */ }
        }
        pendingCandidatesRef.current.delete(from);
      }
    } else if (signalType === 'ice-candidate') {
      const candidate = data as RTCIceCandidateInit;
      const pc = connectionsRef.current.get(from);
      if (pc && pc.remoteDescription) {
        try { await pc.addIceCandidate(candidate); } catch { /* ignore */ }
      } else {
        const pending = pendingCandidatesRef.current.get(from) || [];
        pending.push(candidate);
        pendingCandidatesRef.current.set(from, pending);
      }
    }
  }, [sendSignal, setupDataChannel]);

  const cleanupPeer = useCallback((peerId: string) => {
    const pc = connectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      connectionsRef.current.delete(peerId);
    }
    dataChannelsRef.current.delete(peerId);
    pendingCandidatesRef.current.delete(peerId);
    setConnStatus((prev) => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }, []);

  const cleanupAll = useCallback(() => {
    for (const [, pc] of connectionsRef.current) {
      pc.close();
    }
    connectionsRef.current.clear();
    dataChannelsRef.current.clear();
    pendingCandidatesRef.current.clear();
  }, []);

  const failJoin = useCallback((error: JoinError) => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (admissionTimerRef.current !== null) window.clearTimeout(admissionTimerRef.current);
    admissionTimerRef.current = null;
    admissionStartedRef.current = false;
    expectedPeerIdsRef.current.clear();
    cleanupAll();
    receivingFilesRef.current.clear();
    joinedRoomRef.current = '';
    joinPhaseRef.current = 'idle';
    setJoinedRoom('');
    setJoinPhase('idle');
    setPeers([]);
    setConnStatus({});
    setJoinError(error);
    window.history.replaceState(null, '', window.location.pathname);
  }, [cleanupAll]);
  failJoinRef.current = failJoin;

  const tryAdmit = useCallback(async () => {
    if (joinPhaseRef.current !== 'connecting' || admissionStartedRef.current) return;
    const allConnected = Array.from(expectedPeerIdsRef.current).every(
      (peerId) => dataChannelsRef.current.get(peerId)?.readyState === 'open',
    );
    if (!allConnected) return;

    admissionStartedRef.current = true;
    if (admissionTimerRef.current !== null) window.clearTimeout(admissionTimerRef.current);
    admissionTimerRef.current = null;

    try {
      const response = await fetch('/api/p2p-transfer/admit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: joinedRoomRef.current, peer: selfIdRef.current }),
      });
      if (!response.ok) throw new Error('Admission failed');
      if (joinPhaseRef.current !== 'connecting') return;
      joinPhaseRef.current = 'joined';
      setJoinPhase('joined');
    } catch {
      admissionStartedRef.current = false;
      failJoin({
        title: '无法加入房间',
        description: '房间连接已失效，请稍后重试。',
      });
    }
  }, [failJoin]);
  tryAdmitRef.current = tryAdmit;

  // --- SSE lifecycle ---

  useEffect(() => {
    if (!joinedRoom) return;
    const selfId = selfIdRef.current;
    const name = nicknameRef.current;
    const url = `/api/p2p-transfer/sse?room=${joinedRoom}&peer=${selfId}&name=${encodeURIComponent(name)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as SseMessage;
        if (msg.type === 'peers') {
          setPeers(msg.peers);
          peersRef.current = msg.peers;
          expectedPeerIdsRef.current = new Set(msg.connectionPeers.map((peer) => peer.id));
          for (const peer of msg.connectionPeers) {
            void createConnection(peer.id);
          }
          if (msg.connectionPeers.length === 0) {
            void tryAdmitRef.current();
          } else {
            admissionTimerRef.current = window.setTimeout(() => {
              failJoinRef.current({
                title: '无法建立点对点连接',
                description: '当前设备或网络环境不支持 WebRTC P2P 直连，因此未加入房间。',
              });
            }, ADMISSION_TIMEOUT);
          }
        } else if (msg.type === 'peer-join') {
          setPeers((current) => current.some((p) => p.id === msg.peer.id) ? current : [...current, msg.peer]);
          // Don't initiate — the newcomer will initiate to us
        } else if (msg.type === 'peer-leave' || msg.type === 'peer-cancel') {
          setPeers((current) => current.filter((p) => p.id !== msg.peerId));
          expectedPeerIdsRef.current.delete(msg.peerId);
          cleanupPeer(msg.peerId);
          void tryAdmitRef.current();
        } else if (msg.type === 'join-error') {
          failJoinRef.current({
            title: '昵称已被使用',
            description: '房间内已有同名设备，请更换昵称后重试。',
          });
        } else if (msg.type === 'signal') {
          void handleSignal(msg.from, msg.signalType, msg.data);
        }
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => { /* EventSource auto-reconnects */ };

    return () => {
      es.close();
      eventSourceRef.current = null;
      cleanupAll();
    };
  }, [joinedRoom, createConnection, handleSignal, cleanupPeer, cleanupAll]);

  // Cleanup on unmount
  useEffect(() => () => {
    eventSourceRef.current?.close();
    if (admissionTimerRef.current !== null) window.clearTimeout(admissionTimerRef.current);
    downloadUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    cleanupAll();
  }, [cleanupAll]);

  // --- User actions ---

  const join = async () => {
    const normalizedRoom = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    const normalizedName = nickname.trim().slice(0, 20);
    if (!normalizedRoom || !normalizedName) {
      toast.error('请输入昵称和房间码');
      return;
    }
    joinPhaseRef.current = 'checking';
    setJoinPhase('checking');
    setJoinError(null);
    try {
      await checkWebRtcSupport();
    } catch {
      failJoin({
        title: '无法使用 WebRTC',
        description: '当前浏览器或设备无法建立点对点连接，因此不能加入房间。',
      });
      return;
    }
    eventSourceRef.current?.close();
    cleanupAll();
    receivingFilesRef.current.clear();
    setPeers([]);
    setMessages([]);
    setTransfers([]);
    setConnStatus({});
    expectedPeerIdsRef.current.clear();
    admissionStartedRef.current = false;
    selfIdRef.current = crypto.randomUUID();
    joinedRoomRef.current = normalizedRoom;
    nicknameRef.current = normalizedName;
    setRoomCode(normalizedRoom);
    setNickname(normalizedName);
    try { window.localStorage.setItem(NICKNAME_STORAGE_KEY, normalizedName); } catch { /* localStorage may be unavailable */ }
    setJoinedRoom(normalizedRoom);
    joinPhaseRef.current = 'connecting';
    setJoinPhase('connecting');
    window.history.replaceState(null, '', `${window.location.pathname}?room=${normalizedRoom}`);
  };

  const leave = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    cleanupAll();
    if (admissionTimerRef.current !== null) window.clearTimeout(admissionTimerRef.current);
    admissionTimerRef.current = null;
    admissionStartedRef.current = false;
    expectedPeerIdsRef.current.clear();
    receivingFilesRef.current.clear();
    setJoinedRoom('');
    joinPhaseRef.current = 'idle';
    setJoinPhase('idle');
    setPeers([]);
    setConnStatus({});
    window.history.replaceState(null, '', window.location.pathname);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (joinPhaseRef.current !== 'joined') return;
    const text = draft.trim().slice(0, 2000);
    if (!text) return;
    const id = crypto.randomUUID();
    const time = Date.now();
    const sender = nicknameRef.current;

    const msg: DataChannelMessage = { kind: 'chat', id, sender, text, time };
    const encoded = JSON.stringify(msg);
    let sent = false;
    for (const [, channel] of dataChannelsRef.current) {
      if (channel.readyState === 'open') {
        try { channel.send(encoded); sent = true; } catch { /* ignore */ }
      }
    }
    if (!sent) {
      toast.error('房间内没有可连接的其他设备');
      return;
    }

    setMessages((current) => [...current, { id, peerId: selfIdRef.current, sender, text, time, own: true }]);
    setDraft('');
  };

  const sendFiles = async (files: FileList | File[]) => {
    if (joinPhaseRef.current !== 'joined') return;
    const openChannels = Array.from(dataChannelsRef.current.values()).filter((ch) => ch.readyState === 'open');
    if (openChannels.length === 0) {
      toast.error('房间内还没有其他设备已连接');
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} 超过 1 GB 限制`);
        continue;
      }

      const id = crypto.randomUUID();
      const metadata: FileMetadata = { id, name: file.name, size: file.size, type: file.type, sender: nicknameRef.current };
      const peerCount = openChannels.length;
      setTransfers((current) => [{ ...metadata, progress: 0, direction: 'send', status: 'transferring', peerName: `${peerCount} 台设备` }, ...current]);

      try {
        // Send file metadata to all peers
        const metaMsg: DataChannelMessage = { kind: 'file-meta', id, name: file.name, size: file.size, mimeType: file.type, sender: nicknameRef.current };
        const metaEncoded = JSON.stringify(metaMsg);
        for (const channel of openChannels) {
          if (channel.readyState !== 'open') throw new Error('DataChannel closed');
          channel.send(metaEncoded);
        }

        // Send file chunks via DataChannel (binary, with flow control)
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let lastProgressUpdate = 0;
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const buffer = await file.slice(start, start + CHUNK_SIZE).arrayBuffer();
          const packed = packChunk(id, buffer);

          for (const channel of openChannels) {
            if (channel.readyState !== 'open') throw new Error('DataChannel closed');

            // Flow control: wait if buffer is full
            if (channel.bufferedAmount >= BUFFER_THRESHOLD) {
              await new Promise<void>((resolve, reject) => {
                const cleanup = () => {
                  channel.removeEventListener('bufferedamountlow', handleLow);
                  channel.removeEventListener('close', handleClose);
                  channel.removeEventListener('error', handleClose);
                };
                const handleLow = () => { cleanup(); resolve(); };
                const handleClose = () => { cleanup(); reject(new Error('DataChannel closed')); };
                channel.addEventListener('bufferedamountlow', handleLow, { once: true });
                channel.addEventListener('close', handleClose, { once: true });
                channel.addEventListener('error', handleClose, { once: true });
              });
            }

            if (channel.readyState !== 'open') throw new Error('DataChannel closed');
            channel.send(packed);
          }

          const now = Date.now();
          if (now - lastProgressUpdate >= 100 || i === totalChunks - 1) {
            lastProgressUpdate = now;
            setTransfers((current) => current.map((t) => t.id === id ? { ...t, progress: (i + 1) / totalChunks } : t));
          }
        }

        // Send file end
        const endMsg: DataChannelMessage = { kind: 'file-end', id };
        const endEncoded = JSON.stringify(endMsg);
        for (const channel of openChannels) {
          if (channel.readyState !== 'open') throw new Error('DataChannel closed');
          channel.send(endEncoded);
        }

        setTransfers((current) => current.map((t) => t.id === id ? { ...t, progress: 1, status: 'done' } : t));
      } catch {
        setTransfers((current) => current.map((t) => t.id === id ? { ...t, status: 'error' } : t));
        toast.error(`${file.name} 发送失败`);
      }
    }
  };

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?room=${joinedRoom}`);
    toast.success('房间链接已复制');
  };

  return (
    <div className="flex-1 w-full px-4 pb-12 pt-10 sm:pt-16">
      <main className="mx-auto w-full max-w-6xl">
        <Link href="/tools" className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <RiArrowLeftLine className="size-4" />返回工具箱
        </Link>

        {joinPhase !== 'joined' ? (
          <section className="mx-auto max-w-md border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                <RiRadarLine className="size-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">P2P互传</h1>
                <p className="text-sm text-muted-foreground">输入相同房间码即可建立点对点连接</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block space-y-2 text-sm font-medium">
                你的昵称
                <Input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} placeholder="例如：Lemon 的电脑" disabled={joinPhase !== 'idle'} />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                房间码
                <div className="flex gap-2">
                  <Input className="font-mono uppercase" value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} maxLength={12} disabled={joinPhase !== 'idle'} />
                  <Button type="button" variant="outline" onClick={() => setRoomCode(randomRoomCode())} disabled={joinPhase !== 'idle'}>换一个</Button>
                </div>
              </label>
              <Button className="w-full" size="lg" onClick={() => void join()} disabled={joinPhase !== 'idle'}>
                {joinPhase !== 'idle' && <RiLoader4Line className="size-4 animate-spin" />}
                {joinPhase === 'checking' ? '正在检测 WebRTC' : joinPhase === 'connecting' ? '正在建立点对点连接' : '进入房间'}
              </Button>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">消息和文件通过点对点加密传输，不经过服务器。设备需要保持页面开启。</p>
          </section>
        ) : (
          <section className="overflow-hidden border bg-card shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                  <RiRadarLine className="size-5" />
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-semibold">P2P互传</h1>
                  <p className="text-xs text-muted-foreground">房间 <span className="font-mono font-medium text-foreground">{joinedRoom}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyRoomLink}><RiLink className="size-4" />邀请</Button>
                <Button variant="ghost" size="sm" onClick={leave}>离开</Button>
              </div>
            </header>

            <div className="grid min-h-[640px] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_280px]">
              <aside className="border-b p-4 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>在线设备</span><span>{peers.length + 1}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
                  <div className="flex min-w-40 items-center gap-2 rounded-md bg-muted/60 px-3 py-2.5 text-sm">
                    <RiUser3Line className="size-4 shrink-0" /><span className="truncate">{nickname}</span><span className="ml-auto text-[10px] text-muted-foreground">本机</span>
                  </div>
                  {peers.map((peer) => {
                    const status = connStatus[peer.id];
                    return (
                      <div key={peer.id} className="flex min-w-40 items-center gap-2 rounded-md px-3 py-2.5 text-sm hover:bg-muted/50">
                        <RiUser3Line className="size-4 shrink-0 text-emerald-600" /><span className="truncate">{peer.name}</span>
                        {status === 'connected' && <span className="ml-auto size-2 rounded-full bg-emerald-500" title="已连接" />}
                        {status === 'connecting' && <span className="ml-auto size-2 animate-pulse rounded-full bg-amber-500" title="连接中" />}
                        {status === 'failed' && <span className="ml-auto size-2 rounded-full bg-red-500" title="连接失败" />}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="flex min-h-[460px] min-w-0 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                  {messages.length === 0 ? (
                    <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
                      <RiSendPlane2Line className="mb-3 size-7 text-muted-foreground/50" />
                      <p className="text-sm font-medium">房间已就绪</p>
                      <p className="mt-1 text-xs text-muted-foreground">发条消息，确认设备已经连通</p>
                    </div>
                  ) : messages.map((message) => (
                    <div key={message.id} className={`flex ${message.own ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] ${message.own ? 'text-right' : ''}`}>
                        <div className="mb-1 text-[11px] text-muted-foreground">{message.own ? '我' : message.sender} · {new Date(message.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className={`inline-block whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-left text-sm ${message.own ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{message.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form onSubmit={sendMessage} className="flex items-end gap-2 border-t p-3 sm:p-4">
                  <Button type="button" size="icon" variant="ghost" title="发送文件" onClick={() => fileInputRef.current?.click()}>
                    <RiAttachment2 className="size-5" />
                  </Button>
                  <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="输入消息" maxLength={2000} />
                  <Button type="submit" size="icon" title="发送消息" disabled={!draft.trim()}><RiSendPlane2Line className="size-4" /></Button>
                </form>
              </div>

              <aside className="border-t p-4 md:border-l md:border-t-0">
                <div className="mb-3 text-xs font-medium text-muted-foreground">文件传输</div>
                <button
                  type="button"
                  className={`mb-4 flex w-full flex-col items-center justify-center rounded-md border border-dashed px-3 py-6 text-center transition-colors ${dragging ? 'border-primary bg-muted' : 'hover:border-primary/60 hover:bg-muted/40'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); void sendFiles(event.dataTransfer.files); }}
                >
                  <RiAttachment2 className="mb-2 size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">选择或拖入文件</span>
                  <span className="mt-1 text-xs text-muted-foreground">单个文件不超过 1 GB</span>
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(event) => event.target.files && void sendFiles(event.target.files)} />

                <div className="space-y-3">
                  {transfers.length === 0 && <p className="py-5 text-center text-xs text-muted-foreground">暂无传输任务</p>}
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="rounded-md border p-3">
                      <div className="flex items-start gap-2">
                        <RiFileLine className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium" title={transfer.name}>{transfer.name}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{formatSize(transfer.size)} · {transfer.direction === 'send' ? '发送给' : '来自'} {transfer.peerName}</p>
                        </div>
                        {transfer.status === 'transferring' && <RiLoader4Line className="size-4 shrink-0 animate-spin text-muted-foreground" />}
                        {transfer.status === 'done' && !transfer.url && <RiCheckboxCircleLine className="size-4 shrink-0 text-emerald-600" />}
                        {transfer.url && <a href={transfer.url} download={transfer.name} title="下载文件" className="text-primary hover:opacity-70"><RiDownloadLine className="size-4" /></a>}
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${Math.round(transfer.progress * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      <AlertDialog open={joinError !== null} onOpenChange={(open) => { if (!open) setJoinError(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <RiErrorWarningLine className="size-6" />
            </AlertDialogMedia>
            <AlertDialogTitle>{joinError?.title}</AlertDialogTitle>
            <AlertDialogDescription>{joinError?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setJoinError(null)}>返回</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
