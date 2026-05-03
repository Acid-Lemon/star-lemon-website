import nodemailer from 'nodemailer';
import { getSettings } from './settings';

export async function sendVerificationCode(email: string, code: string) {
    const settings = await getSettings();

    const transporter = nodemailer.createTransport({
        host: settings.smtp_host || process.env.SMTP_HOST,
        port: parseInt(settings.smtp_port || process.env.SMTP_PORT || '587'),
        secure: (settings.smtp_secure || process.env.SMTP_SECURE) === 'true',
        auth: {
            user: settings.smtp_user || process.env.SMTP_USER,
            pass: settings.smtp_pass || process.env.SMTP_PASS,
        },
    });

    const smtpUser = settings.smtp_user || process.env.SMTP_USER;

    const mailOptions = {
        from: `"star和lemon的小站" <${smtpUser}>`,
        to: email,
        subject: '【star和lemon的小站】邮箱验证码',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">邮箱验证</h2>
        <p>你好！</p>
        <p>感谢您来到star和lemon的小站，你的验证码是：</p>
        <div style="background-color: #fff7ed; border: 2px solid #f97316; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 4px;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">验证码 10 分钟内有效，请勿泄露给他人。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">如果这不是你的操作，请忽略此邮件。</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
