import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { loginUser } from '@/lib/auth';
import { getBindData } from '@/lib/qq-bind-store';
import bcrypt from 'bcryptjs';

const providerMeta = {
    qq: {
        name: 'QQ',
        column: 'qq_identifier',
        prefix: 'qq_',
    },
    ceru: {
        name: '澜音',
        column: 'ceru_identifier',
        prefix: 'ceru_',
    },
} as const;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password, bind_token, action, nickname } = body;

        if (!password || !bind_token) {
            return NextResponse.json({ error: '请填写完整信息', success: false }, { status: 400 });
        }

        const bindData = getBindData(bind_token);
        if (!bindData) {
            return NextResponse.json({ error: '绑定会话已过期，请重新使用第三方登录', success: false }, { status: 400 });
        }

        const provider = providerMeta[bindData.provider];
        const oauthIdentifier = `${provider.prefix}${bindData.identifier}`;
        const email = (body.email || bindData.email || '').toString().trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: '请填写有效邮箱', success: false }, { status: 400 });
        }

        const checkProvider = await db.query(`SELECT id FROM users WHERE ${provider.column} = $1`, [oauthIdentifier]);
        if (checkProvider.rows.length > 0) {
            return NextResponse.json({ error: `该${provider.name}账号已绑定其他账号`, success: false }, { status: 400 });
        }

        if (action === 'bind') {
            const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existing.rows.length === 0) {
                return NextResponse.json({ error: '该邮箱未注册，请选择注册新账号', success: false }, { status: 400 });
            }

            const user = existing.rows[0];

            if (!user.password) {
                return NextResponse.json({ error: '该账号未设置密码，请先通过邮箱验证码登录后设置密码', success: false }, { status: 400 });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ error: '密码错误', success: false }, { status: 400 });
            }

            await db.query(`UPDATE users SET ${provider.column} = $1, updated_at = NOW() WHERE id = $2`, [oauthIdentifier, user.id]);

            await loginUser({ id: user.id, nickname: user.nickname, email: user.email, role: user.role, avatar: user.avatar });

            return NextResponse.json({ success: true, redirectUrl: body.redirectUrl || '/' });
        }

        const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return NextResponse.json({ error: '该邮箱已注册，请选择绑定已有账号', success: false }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: '密码至少需要6位', success: false }, { status: 400 });
        }

        if (!nickname) {
            return NextResponse.json({ error: '请填写昵称', success: false }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query(
            `INSERT INTO users (email, nickname, password, role, ${provider.column}, avatar)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [email, nickname, hashedPassword, 'user', oauthIdentifier, bindData.avatar]
        ).then(r => r.rows[0]);

        await loginUser({ id: newUser.id, nickname: newUser.nickname, email: newUser.email, role: newUser.role, avatar: newUser.avatar });

        return NextResponse.json({ success: true, redirectUrl: body.redirectUrl || '/' });
    } catch (error) {
        console.error('OAuth bind-login error:', error);
        return NextResponse.json({ error: '操作失败，请重试', success: false }, { status: 500 });
    }
}
