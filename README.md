# Star & Lemon 博客 / 个人小站

这是一个基于 [Next.js](https://nextjs.org/) App Router 构建的现代化全栈个人博客与小站系统。项目包含了博客文章管理、留言板互动、时间轴记录、数据统计以及完善的后台管理系统。

## ✨ 核心特性

- **博客文章系统**：支持文章发布、阅读以及漂亮的 16:9 卡片式排版。
- **互动留言板**：拥有防垃圾评论和待审核机制的弹幕式留言墙，留言卡片支持随机多彩背景和图片上传。
- **后台管理系统**：安全的管理员控制台，可进行文章管理、留言/评论审核和全局配置管理。
- **发展时间轴**：以直观的时间线形式记录网站或个人的重要里程碑。
- **美观现代的 UI**：采用了 Tailwind CSS 和 Radix UI (shadcn/ui)，全站响应式设计，卡片悬浮与玻璃态光晕效果。
- **API 集成扩展**：已集成一言（Hitokoto）每日诗句，并支持第三方登录（如 QQ 互联）等。

## 🚀 技术栈

- **框架**: Next.js 16 (App Router)
- **UI / 样式**: Tailwind CSS, React, Lucide Icons, shadcn/ui 组件
- **数据库 / 状态**: PostgreSQL (通过 `pg` 库驱动服务器端渲染)
- **前端工具**: Sonner (吐司提示), Next/Font (字体优化)

## 🛠️ 开始使用

### 1. 环境准备

确保你已经安装了以下环境：
- Node.js (建议 18.x 或以上版本)
- PostgreSQL 数据库

### 2. 获取代码与安装依赖

```bash
# 安装依赖
npm install
# 或者
yarn install
# 或者
pnpm install
```

### 3. 环境变量配置

复制 `.env.example` 文件（如果存在）或创建 `.env.local`，填入你的配置信息：

```env
# 数据库连接字符串
DATABASE_URL="postgres://user:password@localhost:5432/your_database"

# JWT Token 秘钥（用于用户登录认证）
JWT_SECRET="your_secure_random_jwt_secret"

# QQ 互联配置（可选）
QQ_APP_ID="your_qq_app_id"
QQ_APP_KEY="your_qq_app_key"
QQ_REDIRECT_URI="http://localhost:3000/api/auth/qq/callback"
```

### 4. 运行开发服务器

```bash
npm run dev
# 或 yarn dev / pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可在浏览器中查看前台界面。
管理后台路由位于 `/admin`。

## 📂 项目结构

```text
├── app/
│   ├── admin/       # 后台管理页面
│   ├── api/         # 内部与外部交互的 API 路由 (RESTful)
│   ├── components/  # 复用的前端 UI 组件
│   ├── guestbook/   # 留言板前台页面
│   ├── post/        # 文章列表与详情页
│   ├── page.tsx     # 网站首页
│   └── layout.tsx   # 全局根布局
├── lib/             # 核心库集合 (如 db.ts, auth.ts, settings.ts)
├── public/          # 静态资源 (图片、图标等)
└── next.config.mjs  # Next.js 配置文件
```

## 📝 了解更多

要了解关于框架的更多信息，请参考：
- [Next.js 文档](https://nextjs.org/docs) 
- [Tailwind CSS 文档](https://tailwindcss.com/docs)