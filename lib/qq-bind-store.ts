interface BindData {
    openid: string;
    nickname: string;
    avatar: string;
    expires: number;
}

const store = new Map<string, BindData>();
const EXPIRE_MS = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store) {
        if (val.expires < now) store.delete(key);
    }
}, 60 * 1000);

export function storeBindData(data: Omit<BindData, 'expires'>): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    store.set(token, { ...data, expires: Date.now() + EXPIRE_MS });
    return token;
}

export function getBindData(token: string): BindData | null {
    const data = store.get(token);
    if (!data || data.expires < Date.now()) {
        store.delete(token);
        return null;
    }
    store.delete(token);
    return data;
}
