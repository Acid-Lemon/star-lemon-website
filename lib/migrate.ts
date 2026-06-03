import db from './db';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
    [tableName]
  );
  return result.rows.length > 0;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2",
    [tableName, columnName]
  );
  return result.rows.length > 0;
}

export async function migrate(): Promise<string[]> {
  const logs: string[] = [];

  const tables: [string, string][] = [
    ['users', `CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      nickname VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      avatar TEXT,
      bio TEXT,
      birthday DATE,
      qq_identifier TEXT,
      sl_coin INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['verification_codes', `CREATE TABLE verification_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['posts', `CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary TEXT,
      content TEXT,
      author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tags VARCHAR[],
      cover TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['messages', `CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      image_url TEXT,
      bg_color TEXT,
      ip_address TEXT,
      location TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['comments', `CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      image_url TEXT,
      parent_id INTEGER,
      ip_address TEXT,
      location TEXT,
      status VARCHAR(50) DEFAULT 'approved',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['moments', `CREATE TABLE moments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['timeline', `CREATE TABLE timeline (
      id SERIAL PRIMARY KEY,
      year INTEGER NOT NULL,
      month INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) DEFAULT 'milestone',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['quotes', `CREATE TABLE quotes (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      source VARCHAR(255),
      category VARCHAR(50) DEFAULT 'anime',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['settings', `CREATE TABLE settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      label VARCHAR(255),
      category VARCHAR(50) DEFAULT 'general',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['friend_links', `CREATE TABLE friend_links (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      avatar TEXT,
      description TEXT,
      status VARCHAR(50) DEFAULT 'approved',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['file_transfers', `CREATE TABLE file_transfers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      code VARCHAR(6) UNIQUE NOT NULL,
      file_name VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL,
      file_key TEXT,
      max_downloads INTEGER NOT NULL DEFAULT 3,
      download_count INTEGER NOT NULL DEFAULT 0,
      retain_days INTEGER NOT NULL DEFAULT 7,
      expire_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['file_transfer_orders', `CREATE TABLE file_transfer_orders (
      id SERIAL PRIMARY KEY,
      transfer_id INTEGER UNIQUE REFERENCES file_transfers(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id),
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      pay_order_no VARCHAR(100),
      out_trade_no VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
      refund_amount NUMERIC(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['file_conversions', `CREATE TABLE file_conversions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      file_name VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL,
      src_format VARCHAR(20) NOT NULL,
      dst_format VARCHAR(20) NOT NULL DEFAULT 'pdf',
      task_id VARCHAR(100),
      page_count INTEGER,
      status VARCHAR(20) NOT NULL DEFAULT 'uploading',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['dev_tasks', `CREATE TABLE dev_tasks (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      assignee_ids INTEGER[] DEFAULT '{}',
      status VARCHAR(50) DEFAULT '待处理',
      type VARCHAR(50) DEFAULT '新功能',
      priority VARCHAR(50) DEFAULT '中',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['file_conversion_orders', `CREATE TABLE file_conversion_orders (
      id SERIAL PRIMARY KEY,
      conversion_id INTEGER UNIQUE REFERENCES file_conversions(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id),
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      pay_order_no VARCHAR(100),
      out_trade_no VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
      refund_amount NUMERIC(10,2) DEFAULT 0,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
    ['coin_recharge_orders', `CREATE TABLE coin_recharge_orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tier_id VARCHAR(50) NOT NULL,
      price_yuan NUMERIC(10,2) NOT NULL,
      coin_amount INTEGER NOT NULL DEFAULT 0,
      bonus_coin INTEGER NOT NULL DEFAULT 0,
      out_trade_no VARCHAR(100) UNIQUE NOT NULL,
      pay_order_no VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`],
  ];

  const indexes: string[] = [
    'CREATE INDEX IF NOT EXISTS idx_fto_transfer_id ON file_transfer_orders(transfer_id)',
    'CREATE INDEX IF NOT EXISTS idx_fto_status ON file_transfer_orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_fc_user_id ON file_conversions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_fc_status ON file_conversions(status)',
    'CREATE INDEX IF NOT EXISTS idx_fco_conversion_id ON file_conversion_orders(conversion_id)',
    'CREATE INDEX IF NOT EXISTS idx_fco_status ON file_conversion_orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_cro_user_id ON coin_recharge_orders(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_cro_status ON coin_recharge_orders(status)',
  ];

  for (const [name, sql] of tables) {
    if (!await tableExists(name)) {
      await db.query(sql);
      logs.push(`表 ${name} 创建成功`);
    }
  }

  for (const sql of indexes) {
    await db.query(sql);
  }

  // Migration: dev_tasks columns
  if (await columnExists('dev_tasks', 'assignee_id')) {
    await db.query('ALTER TABLE dev_tasks DROP COLUMN assignee_id');
    logs.push('dev_tasks.assignee_id 已移除');
  }
  if (!await columnExists('dev_tasks', 'assignee_ids')) {
    await db.query("ALTER TABLE dev_tasks ADD COLUMN assignee_ids INTEGER[] DEFAULT '{}'");
    logs.push('dev_tasks.assignee_ids 已添加');
  }

  // Migration: file_conversions legacy columns
  for (const col of ['src_oss_key', 'output_oss_key', 'pdf_oss_key']) {
    if (await columnExists('file_conversions', col)) {
      await db.query(`ALTER TABLE file_conversions DROP COLUMN ${col}`);
      logs.push(`file_conversions.${col} 已移除`);
    }
  }

  return logs;
}

const defaultSettings: { key: string; value: string; category: string; label: string }[] = [
  // site
  { key: 'site_title', value: '', category: 'site', label: '网站标题' },
  { key: 'site_description', value: '', category: 'site', label: '网站描述' },
  { key: 'site_keywords', value: '', category: 'site', label: '网站关键词' },
  { key: 'site_url', value: '', category: 'site', label: '网站地址' },
  { key: 'icp_number', value: '', category: 'site', label: 'ICP备案号' },
  { key: 'comment_review', value: 'true', category: 'site', label: '评论审核' },
  { key: 'guestbook_review', value: 'true', category: 'site', label: '留言审核' },
  { key: 'quote_enabled', value: 'true', category: 'site', label: '一言功能' },
  { key: 'baidu_site_verification', value: '', category: 'site', label: '百度站点验证码' },
  { key: 'bing_site_verification', value: '', category: 'site', label: 'Bing站点验证码' },
  { key: 'google_site_verification', value: '', category: 'site', label: 'Google站点验证码' },
  // ipapi
  { key: 'ipapi_is_key', value: '', category: 'ipapi', label: 'IPAPI 查询 Key' },
  // mail
  { key: 'smtp_host', value: '', category: 'mail', label: 'SMTP 服务器' },
  { key: 'smtp_port', value: '465', category: 'mail', label: 'SMTP 端口' },
  { key: 'smtp_user', value: '', category: 'mail', label: 'SMTP 用户' },
  { key: 'smtp_pass', value: '', category: 'mail', label: 'SMTP 密码' },
  // summary
  { key: 'summary_api_url', value: '', category: 'summary', label: '摘要接口地址' },
  { key: 'summary_api_model', value: 'deepseek-v4-flash', category: 'summary', label: '摘要模型' },
  { key: 'summary_api_key', value: '', category: 'summary', label: '摘要 API Key' },
  // ai
  { key: 'assistant_enabled', value: 'false', category: 'ai', label: '启用' },
  { key: 'assistant_llm_api_url', value: '', category: 'ai', label: 'LLM接口地址' },
  { key: 'assistant_llm_model', value: 'deepseek-v4-flash', category: 'ai', label: 'LLM模型' },
  { key: 'assistant_llm_api_key', value: '', category: 'ai', label: 'LLM API Key' },
  { key: 'assistant_tts_api_url', value: '', category: 'ai', label: 'TTS接口地址' },
  { key: 'assistant_tts_model', value: '', category: 'ai', label: 'TTS模型' },
  { key: 'assistant_tts_api_key', value: '', category: 'ai', label: 'TTS API Key' },
  { key: 'assistant_system_prompt', value: '你是star和lemon的小站的AI助手，友好地回答访客的问题。', category: 'ai', label: '系统提示词' },
  // oauth
  { key: 'qq_app_id', value: '', category: 'oauth', label: 'QQ App ID' },
  { key: 'qq_app_key', value: '', category: 'oauth', label: 'QQ App Key' },
  // oss
  { key: 'oss_endpoint', value: '', category: 'oss', label: 'OSS Endpoint' },
  { key: 'oss_region', value: '', category: 'oss', label: 'OSS Region' },
  { key: 'oss_bucket', value: '', category: 'oss', label: 'OSS Bucket' },
  { key: 'oss_access_key_id', value: '', category: 'oss', label: 'OSS Access Key ID' },
  { key: 'oss_access_key_secret', value: '', category: 'oss', label: 'OSS Access Key Secret' },
  { key: 'esa_domain', value: '', category: 'oss', label: 'ESA域名' },
  // pay
  { key: 'lantu_mch_id', value: '', category: 'pay', label: '蓝兔商户ID' },
  { key: 'lantu_key', value: '', category: 'pay', label: '蓝兔密钥' },
  // pricing
  { key: 'ft_storage_price', value: '0.01', category: 'pricing', label: '存储单价（元/MB/天）' },
  { key: 'ft_traffic_price', value: '0.05', category: 'pricing', label: '流量单价（元/GB）' },
  { key: 'ft_payment_fee', value: '0.6', category: 'pricing', label: '支付手续费率(%)' },
  { key: 'ft_service_fee', value: '0.7', category: 'pricing', label: '服务费率(%)' },
  { key: 'ft_profit_rate', value: '5', category: 'pricing', label: '利润率(%)' },
  // convert
  { key: 'convert_api_url', value: '', category: 'convert', label: '转换服务地址' },
  { key: 'convert_api_key', value: '', category: 'convert', label: '转换服务 API Key' },
  { key: 'fc_price_per_file', value: '0.01', category: 'convert', label: '文件单价（元）' },
  { key: 'fc_payment_fee', value: '0.6', category: 'convert', label: '支付手续费率(%)' },
  { key: 'fc_service_fee', value: '0.7', category: 'convert', label: '服务费率(%)' },
  { key: 'fc_profit_rate', value: '5', category: 'convert', label: '利润率(%)' },
  // douyin
  { key: 'douyin_api_url', value: '', category: 'douyin', label: '抖音解析接口' },
  { key: 'douyin_embed_mode', value: 'iframe', category: 'douyin', label: '嵌入方式' },
];

export async function insertDefaultSettings(): Promise<void> {
  for (const s of defaultSettings) {
    await db.query(
      `INSERT INTO settings (key, value, category, label) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING`,
      [s.key, s.value, s.category, s.label]
    );
  }

  // Cleanup legacy keys
  const oldKeys = ['fc_price_per_page', 'fc_price_per_image', 'fc_price_page_image', 'fc_price_page_document', 'fc_price_page_spreadsheet', 'fc_price_page_presentation'];
  for (const oldKey of oldKeys) {
    await db.query('DELETE FROM settings WHERE key = $1', [oldKey]);
  }
}

export async function isInitialized(): Promise<boolean> {
  try {
    const result = await db.query("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1");
    return result.rows.length > 0;
  } catch {
    return false;
  }
}