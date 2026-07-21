'use server';

import db from '@/lib/db';
import { loginUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { safeReturnUrl } from '@/lib/security';

export async function loginAction(formData: FormData) {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const returnUrlPath = safeReturnUrl(formData.get('returnUrl')?.toString());

    if (!email || !password) {
        redirect(`/login?error=${encodeURIComponent('请输入邮箱和密码')}&returnUrl=${encodeURIComponent(returnUrlPath)}`);
    }

    let redirectUrl = '';

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            redirectUrl = `/login?error=${encodeURIComponent('邮箱未注册')}&returnUrl=${encodeURIComponent(returnUrlPath)}`;
        } else {
            const user = result.rows[0];
            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                redirectUrl = `/login?error=${encodeURIComponent('邮箱或密码错误')}&returnUrl=${encodeURIComponent(returnUrlPath)}`;
            } else {
                await loginUser({ id: user.id, nickname: user.nickname, email: user.email, role: user.role, avatar: user.avatar });
                redirectUrl = returnUrlPath;
            }
        }
    } catch (error: unknown) {
        console.error('Login error:', error);
        redirectUrl = `/login?error=${encodeURIComponent('登录失败，请重试')}&returnUrl=${encodeURIComponent(returnUrlPath)}`;
    }

    if (redirectUrl) {
        redirect(redirectUrl);
    }
}
