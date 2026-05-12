import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const pool = new Pool({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT || '5432'),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

async function tableExists(client, tableName) {
  const result = await client.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
    [tableName]
  );
  return result.rows.length > 0;
}

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2",
    [tableName, columnName]
  );
  return result.rows.length > 0;
}

async function init() {
  const client = await pool.connect();
  try {
    console.log('开始安全初始化数据库（不会删除已有数据）...');

    // users
    if (!await tableExists(client, 'users')) {
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          nickname VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ users 表创建成功');
    } else {
      console.log('⏭️ users 表已存在，跳过创建');
    }

    const userColumns = [
      { name: 'avatar', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'birthday', type: 'DATE' },
      { name: 'qq_identifier', type: 'TEXT' },
      { name: 'sl_coin', type: 'INTEGER DEFAULT 0' },
    ];
    for (const col of userColumns) {
      if (!await columnExists(client, 'users', col.name)) {
        await client.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ users.${col.name} 字段添加成功`);
      }
    }

    // verification_codes
    if (!await tableExists(client, 'verification_codes')) {
      await client.query(`
        CREATE TABLE verification_codes (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ verification_codes 表创建成功');
    } else {
      console.log('⏭️ verification_codes 表已存在，跳过创建');
    }

    // posts
    if (!await tableExists(client, 'posts')) {
      await client.query(`
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          summary TEXT,
          content TEXT,
          author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          tags VARCHAR[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ posts 表创建成功');
    } else {
      console.log('⏭️ posts 表已存在，跳过创建');
    }

    if (!await columnExists(client, 'posts', 'cover')) {
      await client.query(`ALTER TABLE posts ADD COLUMN cover TEXT`);
      console.log('✅ posts.cover 字段添加成功');
    }

    // messages
    if (!await tableExists(client, 'messages')) {
      await client.query(`
        CREATE TABLE messages (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ messages 表创建成功');
    } else {
      console.log('⏭️ messages 表已存在，跳过创建');
    }

    if (!await columnExists(client, 'messages', 'image_url')) {
      await client.query(`ALTER TABLE messages ADD COLUMN image_url TEXT`);
      console.log('✅ messages.image_url 字段添加成功');
    }

    // comments
    if (!await tableExists(client, 'comments')) {
      await client.query(`
        CREATE TABLE comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'approved',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ comments 表创建成功');
    } else {
      console.log('⏭️ comments 表已存在，跳过创建');
    }

    // moments
    if (!await tableExists(client, 'moments')) {
      await client.query(`
        CREATE TABLE moments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ moments 表创建成功');
    } else {
      console.log('⏭️ moments 表已存在，跳过创建');
    }

    // timeline
    if (!await tableExists(client, 'timeline')) {
      await client.query(`
        CREATE TABLE timeline (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          month INTEGER,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) DEFAULT 'milestone',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ timeline 表创建成功');
    } else {
      console.log('⏭️ timeline 表已存在，跳过创建');
    }

    // quotes
    if (!await tableExists(client, 'quotes')) {
      await client.query(`
        CREATE TABLE quotes (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          source VARCHAR(255),
          category VARCHAR(50) DEFAULT 'anime',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ quotes 表创建成功');
    } else {
      console.log('⏭️ quotes 表已存在，跳过创建');
    }

    // settings
    if (!await tableExists(client, 'settings')) {
      await client.query(`
        CREATE TABLE settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          label VARCHAR(255),
          category VARCHAR(50) DEFAULT 'general',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ settings 表创建成功');
    } else {
      console.log('⏭️ settings 表已存在，跳过创建');
    }

    // friend_links
    if (!await tableExists(client, 'friend_links')) {
      await client.query(`
        CREATE TABLE friend_links (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          avatar TEXT,
          description TEXT,
          status VARCHAR(50) DEFAULT 'approved',
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ friend_links 表创建成功');
    } else {
      console.log('⏭️ friend_links 表已存在，跳过创建');
    }

    // file_transfers
    if (!await tableExists(client, 'file_transfers')) {
      await client.query(`
        CREATE TABLE file_transfers (
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
        )
      `);
      console.log('✅ file_transfers 表创建成功');
    } else {
      console.log('⏭️ file_transfers 表已存在，跳过创建');
    }

    // file_transfer_orders
    if (!await tableExists(client, 'file_transfer_orders')) {
      await client.query(`
        CREATE TABLE file_transfer_orders (
          id SERIAL PRIMARY KEY,
          transfer_id INTEGER UNIQUE REFERENCES file_transfers(id) ON DELETE SET NULL,
          user_id INTEGER REFERENCES users(id),
          price NUMERIC(10,2) NOT NULL DEFAULT 0,
          pay_order_no VARCHAR(100),
          out_trade_no VARCHAR(100),
          status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
          refund_amount NUMERIC(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_fto_transfer_id ON file_transfer_orders(transfer_id)`);
      await client.query(`CREATE INDEX idx_fto_status ON file_transfer_orders(status)`);
      console.log('✅ file_transfer_orders 表创建成功');
    } else {
      console.log('⏭️ file_transfer_orders 表已存在，跳过创建');
    }

    // file_conversions
    if (!await tableExists(client, 'file_conversions')) {
      await client.query(`
        CREATE TABLE file_conversions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          file_name VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          src_format VARCHAR(20) NOT NULL,
          src_oss_key TEXT,
          pdf_oss_key TEXT,
          task_id VARCHAR(100),
          page_count INTEGER,
          status VARCHAR(20) NOT NULL DEFAULT 'uploading',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_fc_user_id ON file_conversions(user_id)`);
      await client.query(`CREATE INDEX idx_fc_status ON file_conversions(status)`);
      console.log('✅ file_conversions 表创建成功');
    } else {
      console.log('⏭️ file_conversions 表已存在，跳过创建');
    }

    // file_conversion_orders
    if (!await tableExists(client, 'file_conversion_orders')) {
      await client.query(`
        CREATE TABLE file_conversion_orders (
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
        )
      `);
      await client.query(`CREATE INDEX idx_fco_conversion_id ON file_conversion_orders(conversion_id)`);
      await client.query(`CREATE INDEX idx_fco_status ON file_conversion_orders(status)`);
      console.log('✅ file_conversion_orders 表创建成功');
    } else {
      console.log('⏭️ file_conversion_orders 表已存在，跳过创建');
    }

    // coin_recharge_orders
    if (!await tableExists(client, 'coin_recharge_orders')) {
      await client.query(`
        CREATE TABLE coin_recharge_orders (
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
        )
      `);
      await client.query(`CREATE INDEX idx_cro_user_id ON coin_recharge_orders(user_id)`);
      await client.query(`CREATE INDEX idx_cro_status ON coin_recharge_orders(status)`);
      console.log('✅ coin_recharge_orders 表创建成功');
    } else {
      console.log('⏭️ coin_recharge_orders 表已存在，跳过创建');
    }

    console.log('\n🎉 数据库初始化完成，已有数据安全无影响');
    process.exit(0);
  } catch (err) {
    console.error('❌ 初始化失败:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
