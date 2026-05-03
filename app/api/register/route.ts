import {NextResponse} from 'next/server';
import db from '../../../lib/db';
import bcrypt from 'bcryptjs';
import {loginUser} from '../../../lib/auth';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const code = formData.get('code')?.toString();
        const password = formData.get('password')?.toString();
        const nickname = formData.get('nickname')?.toString() || email?.split('@')[0];

        if (!email || !code || !password || !nickname) {
            return NextResponse.redirect(new URL('/register?error=请填写完整信息', request.url));
        }

        // 检查邮箱是否已注册
        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return NextResponse.redirect(new URL('/register?error=该邮箱已被注册', request.url));
        }

        // 检查验证码
        const codeResult = await db.query(
            'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code]
        );

        if (codeResult.rows.length === 0) {
            return NextResponse.redirect(new URL('/register?error=验证码错误或已失效', request.url));
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const insertResult = await db.query(
      'INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname, role, avatar',
      [email, hashedPassword, nickname]
    );
    
    // 清除已使用的验证码记录
    await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    // 自动登录
    const finalUser = insertResult.rows[0];
    await loginUser({ id: finalUser.id, email: finalUser.email, nickname: finalUser.nickname, role: finalUser.role, avatar: finalUser.avatar });

    return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
        console.error('注册失败:', error);
        return NextResponse.redirect(new URL('/register?error=注册失败，请稍后重试', request.url));
    }
}
