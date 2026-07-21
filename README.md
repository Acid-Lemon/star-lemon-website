# Star & Lemon 博客 / 个人小站

Star & Lemon（星柠）是一个基于 Next.js App Router 构建的个人博客与小站系统。项目以内容展示和访客互动为核心，同时包含文件快传、文件转换、站点积分、支付、AI 助手和后台管理能力。

## 核心功能

### 前台体验

- **博客文章**：支持文章列表、详情页、Markdown 渲染、代码高亮、封面图、评论与 AI 摘要。
- **动态分享**：发布图文动态，前台瀑布流展示，后台审核与管理。
- **留言板**：支持文字、图片、颜色背景、访客位置记录和后台审核。
- **朋友链接**：展示友链并支持访客提交申请。
- **一言/语录**：展示站内语录内容，可在后台维护。
- **时间轴**：记录网站或个人的重要节点。
- **用户系统**：邮箱注册、密码登录、邮箱验证码登录、QQ 登录/绑定、Ceru OAuth 登录、个人资料和安全设置。
- **AI 助手**：可配置 LLM 与 TTS 接口，为访客提供站内助手对话。

### 工具与交易

- **文件快传**：上传文件生成取件码，支持下载次数、保留天数、过期时间、微信扫码支付和退款记录。
- **文件转换**：上传文件并调用外部转换服务，支持任务状态、下载、计费与订单记录。
- **星柠币充值**：用户可充值站内积分，用于站内付费能力扩展。

### 后台管理

- **仪表盘**：站点数据概览。
- **内容管理**：文章、动态、留言、评论、语录、时间轴、友链管理。
- **用户管理**：用户列表、资料编辑、权限与账号操作。
- **工具管理**：文件快传、文件转换、订单和退款记录管理。
- **开发任务**：站内开发任务记录与分配。
- **系统设置**：站点信息、SEO 验证、邮件、OAuth、OSS、支付、AI、文件转换、价格策略等配置。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Next.js 16.2.6, App Router |
| 前端 | React 19.2.4, TypeScript 5 |
| 样式 | Tailwind CSS 4, shadcn/ui, @base-ui/react |
| 图标 | @remixicon/react |
| 数据库 | PostgreSQL, pg |
| 认证 | JWT, jose, bcryptjs |
| 存储 | 阿里云 OSS |
| 支付 | 蓝兔支付 |
| 邮件 | Nodemailer |
| AI | 可配置 LLM / TTS 接口，默认摘要接口指向 DeepSeek 兼容 API |
| 其他 | Sonner, react-markdown, rehype-highlight, recharts, embla-carousel |

## 环境要求

- Node.js 20+
- pnpm 9.15.4
- PostgreSQL

## 本地启动

1. 安装依赖：

```bash
pnpm install
```

2. 创建 `.env.local`：

```env
DATABASE_URL=postgresql://user:password@host:5432/star_lemon
JWT_SECRET=replace_with_at_least_32_random_characters
NEXT_PUBLIC_URL=http://localhost:3000
```

`DATABASE_URL` 和至少 32 个字符的 `JWT_SECRET` 是必需项，缺失时认证和验证码接口会明确报错。`NEXT_PUBLIC_URL` 用于 OAuth 回调、支付通知地址和站点链接生成。Ceru OAuth 的 App ID 和 App Secret 必须通过环境变量或后台设置配置，代码不再提供默认凭据。

3. 初始化或迁移数据库：

```bash
node scripts/init-db.mjs
```

该脚本会安全创建缺失的数据表和字段，不会删除已有业务数据。

4. 启动开发服务器：

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。后台入口为 `/admin`。

## 常用脚本

```bash
pnpm dev      # 使用 webpack 启动 Next.js 开发服务器
pnpm build    # 构建生产版本
pnpm start    # 启动生产服务器
pnpm lint     # 运行 ESLint
```

## 配置说明

项目只要求少量基础环境变量，其余配置主要通过后台「系统设置」写入 `settings` 表。

常见可配置项包括：

- 站点名称、站点地址、SEO 验证码
- SMTP 邮件服务
- QQ 互联、Ceru OAuth
- 阿里云 OSS
- 蓝兔支付
- 文件快传价格策略
- 文件转换服务地址、API Key 和价格策略
- AI 摘要、AI 助手 LLM 与 TTS
- IP 查询服务

配置读取优先级通常为：数据库设置 > 环境变量 > 默认值。

## 数据库表

初始化脚本会维护以下核心表：

- `users`：用户、资料、第三方登录标识和站内积分
- `verification_codes`：邮箱验证码
- `posts`：博客文章
- `messages`：留言板消息
- `comments`：文章评论
- `moments`：动态
- `timeline`：时间轴
- `quotes`：语录
- `settings`：系统配置
- `friend_links`：友链
- `file_transfers`：文件快传记录
- `file_transfer_orders`：文件快传订单
- `file_conversions`：文件转换任务
- `file_conversion_orders`：文件转换订单
- `coin_recharge_orders`：站内积分充值订单
- `dev_tasks`：开发任务

## 项目结构

```text
├── app/
│   ├── admin/                  # 后台管理页面
│   ├── api/                    # Route Handlers
│   ├── components/             # 业务共享组件
│   ├── guestbook/              # 留言板
│   ├── login/                  # 登录
│   ├── register/               # 注册
│   ├── moments/                # 动态
│   ├── post/                   # 文章列表与详情
│   ├── quotes/                 # 语录页
│   ├── friends/                # 友链页
│   ├── tools/                  # 文件快传、文件转换等工具
│   ├── recharge/               # 星柠币充值
│   ├── contact/                # 联系页
│   ├── about/                  # 关于页
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页
├── components/ui/              # shadcn/ui 组件
├── hooks/                      # React hooks
├── lib/                        # 数据库、认证、OSS、邮件、支付、AI 等核心库
├── public/                     # 静态资源
├── scripts/                    # 数据库初始化脚本
├── types/                      # 类型声明
├── middleware.ts               # 中间件
├── next.config.ts              # Next.js 配置
└── package.json                # 项目脚本与依赖
```

## 相关文档

- [PRODUCT.md](./PRODUCT.md)：产品定位与设计原则
- [DESIGN.md](./DESIGN.md)：主题、色彩、排版与组件规范
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
