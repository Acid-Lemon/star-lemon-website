# Star & Lemon 博客 / 个人小站

基于 Next.js 16 App Router 构建的现代化全栈个人博客与小站系统，集成了博客文章、动态分享、留言互动、文件快传、支付系统以及完善的后台管理。

## 核心特性

### 前台功能
- **博客文章系统**：支持 Markdown 文章发布、阅读，卡片式排版，AI 辅助生成摘要
- **动态分享（Moments）**：发布图文动态，支持图片上传，瀑布流展示
- **互动留言板**：弹幕式留言墙，支持图片上传，留言审核机制
- **文件快传**：上传文件生成取件码，支持微信扫码支付，按存储和流量计费
- **一言（Hitokoto）**：每日随机展示精选语句
- **发展时间轴**：记录网站或个人的重要里程碑
- **用户系统**：邮箱注册/登录、邮箱验证码登录、QQ 互联登录、个人资料管理

### 后台管理
- **仪表盘**：数据统计概览
- **内容管理**：文章管理、动态管理、一言管理
- **互动审核**：留言审核、评论审核
- **用户管理**：查看用户列表、编辑用户信息、重置密码、删除用户
- **文件快传管理**：文件管理（查看/删除/退款）、订单记录查询
- **系统设置**：站点配置、邮件服务、AI 接口、OAuth、OSS、支付、定价等全局配置

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.2.2 (App Router) |
| 前端 | React 19.2.4, TypeScript 5 |
| 样式 | Tailwind CSS 4, shadcn/ui, @base-ui/react |
| 图标 | @remixicon/react |
| 数据库 | PostgreSQL (pg) |
| 认证 | JWT (jose), bcryptjs |
| 存储 | 阿里云 OSS |
| 加速 | 阿里云 ESA (Edge Security Acceleration) |
| 支付 | 蓝兔支付（微信 Native 扫码支付）|
| 邮件 | Nodemailer |
| AI | DeepSeek API |
| 其他 | Sonner, react-markdown, recharts, embla-carousel |

## 数据库表

- `users` — 用户表（支持邮箱/QQ登录）
- `verification_codes` — 邮箱验证码表
- `posts` — 博客文章表
- `messages` — 留言表
- `comments` — 评论表
- `moments` — 动态表
- `timeline` — 时间轴表
- `hitokoto` — 一言语句表
- `settings` — 系统配置表（键值对）
- `file_transfers` — 文件快传订单表
- `file_transfer_orders` — 文件快传支付订单记录表

## 环境变量

创建 `.env.local` 文件，仅存放数据库连接和 JWT 密钥：

```env
# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=star_lemon

# JWT
JWT_SECRET=your_jwt_secret
```

其他所有配置（QQ 登录、邮件服务、OSS、支付、AI 等）均在管理后台的「系统设置」页面中进行配置，数据存储在数据库的 `settings` 表中。部分配置也支持通过环境变量覆盖（优先级：数据库设置 > 环境变量 > 默认值）。

## 开始使用

```bash
# 安装依赖
pnpm install

# 初始化数据库
node scripts/init-db.mjs

# 运行开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)，管理后台路由为 `/admin`。

## 项目结构

```text
├── app/
│   ├── admin/           # 后台管理页面
│   ├── api/             # API 路由
│   ├── components/      # 共享组件
│   ├── guestbook/       # 留言板
│   ├── login/           # 登录页
│   ├── moments/         # 动态页
│   ├── post/            # 文章列表/详情
│   ├── register/        # 注册页
│   ├── tools/           # 工具箱（文件快传）
│   ├── about/           # 关于/联系
│   ├── page.tsx         # 首页
│   └── layout.tsx       # 根布局
├── components/ui/       # shadcn/ui 组件
├── lib/                 # 核心库（db, auth, oss, mail, ai, pay）
├── scripts/             # 数据库迁移脚本
└── next.config.ts       # Next.js 配置
```

## 第三方服务集成

- **QQ 互联**：OAuth2 登录
- **阿里云 OSS**：图片/文件存储
- **阿里云 ESA**：CDN 加速下载
- **蓝兔支付**：微信支付（Native 扫码）
- **DeepSeek**：AI 文章摘要生成
- **Hitokoto API**：每日语句

## 更多文档

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
