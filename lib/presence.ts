const HEARTBEAT_TIMEOUT = 30_000;
const CLEANUP_INTERVAL = 15_000;

interface PresenceEntry {
    lastSeen: number;
    page: string;
}

const presence = new Map<string, PresenceEntry>();

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [id, entry] of presence) {
            if (now - entry.lastSeen > HEARTBEAT_TIMEOUT) {
                presence.delete(id);
            }
        }
    }, CLEANUP_INTERVAL);

    if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
        (cleanupTimer as NodeJS.Timeout).unref();
    }
}

export function heartbeat(visitorId: string, page: string) {
    ensureCleanup();
    presence.set(visitorId, { lastSeen: Date.now(), page });
}

export function removeVisitor(visitorId: string) {
    presence.delete(visitorId);
}

export function getOnlineCount(): number {
    const now = Date.now();
    let count = 0;
    for (const entry of presence.values()) {
        if (now - entry.lastSeen <= HEARTBEAT_TIMEOUT) count++;
    }
    return count;
}

export function getPageReaders(pagePath: string): number {
    const now = Date.now();
    let count = 0;
    for (const entry of presence.values()) {
        if (now - entry.lastSeen <= HEARTBEAT_TIMEOUT && entry.page === pagePath) count++;
    }
    return count;
}

export function getStats() {
    return {
        online: getOnlineCount(),
        total: presence.size,
    };
}
