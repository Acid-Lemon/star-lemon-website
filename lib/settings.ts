import db from './db';

// 缓存设置
let cachedSettings: Record<string, string> | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 1分钟缓存

// 获取所有设置（服务端）
export async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  
  // 使用缓存
  if (cachedSettings && now - cacheTime < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    const result = await db.query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    result.rows.forEach((row: any) => {
      settings[row.key] = row.value || '';
    });
    
    cachedSettings = settings;
    cacheTime = now;
    return settings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return {};
  }
}

// 获取单个设置
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const settings = await getSettings();
  return settings[key] || defaultValue;
}

// 清除缓存（在设置更新后调用）
export function clearSettingsCache() {
  cachedSettings = null;
  cacheTime = 0;
}
