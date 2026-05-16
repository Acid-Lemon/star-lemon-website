import {NextResponse} from 'next/server';
import db from '../../../lib/db';
import bcrypt from 'bcryptjs';
import {loginUser} from '../../../lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email?.toString();
        const code = body.code?.toString();
        const password = body.password?.toString();
        const nickname = body.nickname?.toString() || email?.split('@')[0];

        if (!email || !code || !password || !nickname) {
            return NextResponse.json({ success: false, error: '请填写完整信息' }, { status: 400 });
        }

        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return NextResponse.json({ success: false, error: '该邮箱已被注册' }, { status: 400 });
        }

        const codeResult = await db.query(
            'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code]
        );

        if (codeResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: '验证码错误或已失效' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertResult = await db.query(
            'INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname, role, avatar',
            [email, hashedPassword, nickname]
        );

        await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);

        const finalUser = insertResult.rows[0];
        await loginUser({ id: finalUser.id, email: finalUser.email, nickname: finalUser.nickname, role: finalUser.role, avatar: finalUser.avatar });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('注册失败:', error);
        return NextResponse.json({ success: false, error: '注册失败，请稍后重试' }, { status: 500 });
    }
}
