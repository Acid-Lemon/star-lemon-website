'use server';

import db from '@/lib/db';
import { loginUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { safeReturnUrl } from '@/lib/security';

export async function codeLoginAction(formData: FormData) {
    const email = formData.get('email')?.toString();
    const code = formData.get('code')?.toString();
    const returnUrlPath = safeReturnUrl(formData.get('returnUrl')?.toString());

    if (!email || !code) {
        redirect(`/login?error=${encodeURIComponent('请输入邮箱和验证码')}&returnUrl=${encodeURIComponent(returnUrlPath)}`);
    }

    let redirectUrl = '';

    try {
        const codeResult = await db.query(
            'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code]
        );

        if (codeResult.rows.length === 0) {
            redirectUrl = `/login?error=${encodeURIComponent('验证码错误或已过期')}&returnUrl=${encodeURIComponent(returnUrlPath)}`;
        } else {
            await db.query('DELETE FROM verification_codes WHERE email = $1', [email]);

            const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userResult.rows.length === 0) {
                redirectUrl = `/login?error=${encodeURIComponent('该邮箱未注册')}&returnUrl=${encodeURIComponent(returnUrlPath)}`;
            } else {
                const user = userResult.rows[0];
                await loginUser({ id: user.id, nickname: user.nickname, email: user.email, role: user.role, avatar: user.avatar });
                redirectUrl = returnUrlPath;
            }
        }
    } catch (error: unknown) {
        console.error('Code login error:', error);
        redirectUrl = `/login?error=${encodeURIComponent('登录失败，请重试')}&returnUrl=${encodeURIComponent(returnUrlPath)}`;
    }

    if (redirectUrl) {
        redirect(redirectUrl);
    }
}
