# JWT 滑动续期：让登录状态自然延续

> 从硬性 24 小时过期到 7 天滚动窗口，一次 Session 管理的改造实录。

## 背景

最初的实现很简单——登录成功后签发一个 JWT，塞进 HttpOnly Cookie，有效期 24 小时。到期了？重新登录。

这没什么问题，但用户体验上有个尴尬的场景：用户连续一周每天都在访问网站，第六天晚上刷完最后一篇文章，第二天早上回来，Session 过期了，被迫重新登录。

明明昨天还在用，凭什么今天就要重新认证？

本质矛盾在于：**固定过期时间是绝对的，而用户的使用是连续的。** 一个活跃用户不应该因为时钟走到了某个刻度而被踢出。

## 目标

很朴素的一条规则：

**七天内有过访问的，保持登录；超过七天没来的，自然过期。**

不是"七天硬过期"，而是"七天滑动窗口"——每一次访问都把窗口往后推。

## 方案选择

有几种常见做法：

| 方案 | 做法 | 问题 |
|------|------|------|
| **长过期 + 不续签** | JWT 直接设 7d 或 30d | 无法收回，一旦签发就无法主动失效 |
| **双 Token（Access + Refresh）** | 短期 Access Token + 长期 Refresh Token | 复杂度陡增，需要额外存储 Refresh Token，两次请求换一次 Token |
| **滑动续期** | 每次请求检测剩余有效期，临近过期时静默续签 | 简单，无额外存储，天然实现滚动窗口 |

我们选了第三种。理由：

1. **实现成本最低**——Middleware 里加几行判断，不需要数据库、不需要 Refresh Token 端点
2. **行为符合直觉**——活跃用户无感续期，不活跃用户自然过期
3. **可回收性**——7 天窗口比 30 天硬过期可控得多，服务端虽不能主动撤销单条 JWT，但窗口本身就限制了风险周期

## 实现细节

### 常量定义

```typescript
// lib/auth.ts
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;  // 7 天（毫秒）
export const SESSION_DURATION_S  = 7 * 24 * 60 * 60;         // 7 天（秒）
export const RENEW_THRESHOLD_S   = SESSION_DURATION_S / 2;   // 3.5 天（续期触发阈值）
```

`RENEW_THRESHOLD_S = 3.5 天` 的含义：当 JWT 剩余有效期不足总时长的**一半**时，触发续期。为什么不等到最后几个小时？

- 避免续期和过期在时间上太近，用户如果断网/关浏览器，下次回来可能刚好越过那条线
- 一半是常见实践，值可以调，但逻辑不变：**越早续，越不容易意外过期**

### JWT 签发

```typescript
export async function encrypt(payload: { user: any; time: number }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')       // ← 从 '24h' 改为 '7d'
        .sign(key);
}
```

Cookie 的 expires 同步改为 7 天，和 JWT 的 exp 保持一致。

### Middleware — 续期的核心

这是整个方案最关键的代码，在 Middleware 里完成两件事：

1. **解析现有 Session**——如果能解出来，看看剩多少时间
2. **判断是否续期**——剩余 < 3.5 天时，静默签发新 JWT 写回 Cookie

```typescript
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  let sessionPayload: any = null;
  let newSessionToken: string | null = null;
  let clearSession = false;

  if (sessionCookie) {
    try {
      sessionPayload = await decrypt(sessionCookie);
      const now = Math.floor(Date.now() / 1000);
      const remaining = (sessionPayload.exp as number) - now;
      if (remaining > 0 && remaining < RENEW_THRESHOLD_S) {
        // 剩余不足 3.5 天，静默续期
        newSessionToken = await encrypt({
          user: sessionPayload.user,
          time: sessionPayload.time,
        });
      }
    } catch {
      // JWT 验证失败（过期或篡改），清除 Cookie
      clearSession = true;
    }
  }

  // ... 路由保护逻辑（/admin 等）

  const response = NextResponse.next();
  if (newSessionToken) {
    response.cookies.set('session', newSessionToken, {
      expires: new Date(Date.now() + SESSION_DURATION_MS),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  } else if (clearSession) {
    response.cookies.set('session', '', { expires: new Date(0) });
  }

  return response;
}
```

### 路由匹配

为了让续期对所有访问生效，Matcher 需要覆盖整个站点（排除静态资源）：

```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

这意味着：页面访问、API 调用、甚至 WebSocket 升级请求——只要用户在和站点交互，Session 都有机会续期。

## 时间线示意

假设用户在 Day 0 登录：

```
Day 0  登录，签发 JWT（exp = Day 7）
Day 1  访问，remaining = 6d > 3.5d → 不续期
Day 2  访问，remaining = 5d > 3.5d → 不续期
Day 3  访问，remaining = 4d > 3.5d → 不续期
Day 4  访问，remaining = 3d < 3.5d → ✅ 续期，新 exp = Day 11
Day 5  访问，remaining = 6d > 3.5d → 不续期
Day 6  访问，remaining = 5d > 3.5d → 不续期
...
Day 10 访问，remaining = 1d < 3.5d → ✅ 续期，新 exp = Day 17

如果 Day 4 之后再也不访问：
Day 11 → JWT 过期 → 下次访问需要重新登录
```

效果：**活跃用户的 Session 永不过期；不活跃用户 7 天后自然失效。**

## 和双 Token 方案的对比

有人可能会问：为什么不搞 Access Token + Refresh Token？

| 维度 | 滑动续期 | Access + Refresh |
|------|---------|-------------------|
| 请求次数 | 0 次额外请求（Middleware 透明处理） | 换 Token 需一次额外请求 |
| 存储依赖 | 无（JWT 自包含） | Refresh Token 需数据库或 Redis 存储 |
| 主动撤销 | 不能撤销单条 JWT，但窗口只有 7d | 可以在存储层删 Refresh Token 立即吊销 |
| 实现复杂度 | Middleware 加几行 | 新增 API 端点、存储层、客户端换 Token 逻辑 |
| 适用规模 | 中小型站点 | 大规模、需要即时吊销的场景 |

对我们这个站点来说，7 天窗口已经足够短，主动吊销的需求不强。如果将来确实需要即时吊销能力（比如用户改密码后强制踢出所有 Session），可以在 Middleware 里加一个版本号校验：用户表加 `session_version` 字段，JWT payload 里带上版本号，Middleware 比对版本不一致就清掉 Cookie。这比 Refresh Token 方案简单得多。

## 注意事项

1. **续期不是每次请求都做**——只在剩余不足一半时触发，绝大多数请求只是读 Cookie + 验证签名，开销极小
2. **过期的 Session 会自动清除**——`decrypt` 失败时设置 `clearSession = true`，响应里写空 Cookie，避免浏览器留着过期的无效 Cookie
3. **Cookie 和 JWT 的 expires 必须同步**——Cookie 的 max-age 必须大于等于 JWT 的 exp，否则 JWT 还没过期浏览器就不发 Cookie 了
4. **生产环境必须设置 `JWT_SECRET`**——当前有硬编码回退值，只在开发时用，生产环境漏配等于公开密钥

## 改动清单

| 文件 | 改动 |
|------|------|
| `lib/auth.ts` | JWT 过期时间 `24h` → `7d`；Cookie expires 同步改为 7d；新增 `SESSION_DURATION_MS`、`SESSION_DURATION_S`、`RENEW_THRESHOLD_S` 常量 |
| `middleware.ts` | Matcher 从 `/admin/:path*` 扩展为全站（排除静态资源）；新增滑动续期逻辑；过期 Session 自动清除 |

总共约 30 行改动，没有新增文件，没有新增依赖，没有新增 API 端点。