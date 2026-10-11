import { createRequire } from 'node:module';
import pg from 'pg';
import { timelineSchemaSql } from './timeline-schema.mjs';

const require = createRequire(import.meta.url);
createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd());

// Milestones based on the repository's commit history, recorded at month precision.
const milestones = [
  ['2026-04', '星柠小站，从这里出发', '创建项目仓库，以 Next.js 搭建小站的基础框架，开始记录 Star 与 Lemon 的开发旅程。', 'milestone'],
  ['2026-05', '主页焕新，搭建内容展示空间', '更新首页样式与布局，整理站内语录功能，并改进数据库初始化方式，让小站的展示与维护更加完善。', 'update'],
  ['2026-05', '文件快传持续完善', '为文件快传加入大文件分片上传，完善支付订单、退款通知与删除退款流程，并接入星柠币支付。', 'milestone'],
  ['2026-05', '让小站拥有更多个性', '加入深色模式、多主题切换与主题装饰，首页增加在线状态和打字机效果，让访问体验更加生动。', 'update'],
  ['2026-05', '文件转换工具加入小站', '新增文件转换服务，支持多种格式转为 PDF，随后扩展多格式输出、按文件计费和后台转换记录管理。', 'milestone'],
  ['2026-05', '动态分享走向多媒体', '动态支持抖音与哔哩哔哩视频链接解析和嵌入播放，让日常分享从文字与图片延伸到视频。', 'update'],
  ['2026-05', 'AI 助手与文章摘要登场', '接入可配置的 AI 助手和文章摘要功能，为访客提供对话入口，也帮助读者快速了解文章内容。', 'milestone'],
  ['2026-06', '站点初始化与管理更加便捷', '新增站点初始化向导并完善配置流程，改进 OSS 上传，扩展后台用户管理、文章发布与动态状态管理。', 'update'],
  ['2026-06', '登录方式进一步丰富', '加入图形验证码，集成澜音音乐 OAuth，并重构 QQ 登录的通用框架，持续完善账号访问体验。', 'update'],
  ['2026-07', '文件上传与动态分享继续进化', '重构文件快传上传流程，完善分片上传；动态新增 B 站空间链接解析与嵌入，方便分享创作者主页。', 'update'],
  ['2026-10', '新增 P2P 文件传输', '为小站工具箱加入 P2P 文件传输能力，同时继续优化文件上传体验和管理后台，拓展文件分享方式。', 'milestone'],
];

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
let client;
try {
  client = await pool.connect();
  await client.query('BEGIN');
  await client.query(timelineSchemaSql);
  // Serialize this script's duplicate checks if it is invoked concurrently.
  await client.query('LOCK TABLE timeline IN SHARE ROW EXCLUSIVE MODE');
  let inserted = 0;
  for (const [date, title, description, type] of milestones) {
    const result = await client.query(
      `INSERT INTO timeline (date, title, description, type, is_active)
       SELECT $1::text, $2::text, $3::text, $4::text, true
       WHERE NOT EXISTS (SELECT 1 FROM timeline WHERE date = $1::text AND title = $2::text)
       RETURNING id`,
      [date, title, description, type],
    );
    inserted += result.rowCount;
  }
  const result = await client.query(
    'SELECT id, date, title, type, is_active FROM timeline ORDER BY date ASC, id ASC',
  );
  await client.query('COMMIT');
  console.log(`已新增 ${inserted} 条时间轴，跳过 ${milestones.length - inserted} 条重复记录。`);
  console.table(result.rows);
} catch (error) {
  if (client) await client.query('ROLLBACK').catch(() => {});
  console.error('写入时间轴失败:', error.message);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
