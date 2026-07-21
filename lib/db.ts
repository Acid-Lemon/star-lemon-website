import { Pool } from 'pg';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 20000,
};

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  const globalWithPg = global as typeof globalThis & {
    _pgPool?: Pool;
  };
  if (!globalWithPg._pgPool) {
    globalWithPg._pgPool = new Pool(poolConfig);
  }
  pool = globalWithPg._pgPool;
}

const db = {
  // 直接包装 pg 的 query，返回标准的 pg result 对象
  query: async (text: string, params?: unknown[]) => {
    return await pool.query(text, params);
  },
  pool,
};

export default db;
