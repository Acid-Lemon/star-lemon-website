import nodemailer from 'nodemailer';
import { getSettings } from './settings';

async function createTransporter() {
    const settings = await getSettings();
    return nodemailer.createTransport({
        host: settings.smtp_host || process.env.SMTP_HOST,
        port: parseInt(settings.smtp_port || process.env.SMTP_PORT || '587'),
        secure: (settings.smtp_secure || process.env.SMTP_SECURE) === 'true',
        auth: {
            user: settings.smtp_user || process.env.SMTP_USER,
            pass: settings.smtp_pass || process.env.SMTP_PASS,
        },
    });
}

export async function sendVerificationCode(email: string, code: string) {
    const settings = await getSettings();
    const transporter = await createTransporter();
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

export async function sendReviewNotification(type: 'message' | 'comment', content: string, authorName: string) {
    const settings = await getSettings();
    const adminEmail = settings.admin_email || settings.smtp_user || process.env.SMTP_USER;

    if (!adminEmail) return;

    try {
        const transporter = await createTransporter();
        const smtpUser = settings.smtp_user || process.env.SMTP_USER;
        const typeLabel = type === 'message' ? '留言' : '评论';
        const reviewUrl = type === 'message'
            ? `${settings.site_url}/admin/messages`
            : `${settings.site_url}/admin/comments`;

        const mailOptions = {
            from: `"star和lemon的小站" <${smtpUser}>`,
            to: adminEmail,
            subject: `【star和lemon的小站】新的${typeLabel}待审核`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">新的${typeLabel}待审核</h2>
          <p>有一条新的${typeLabel}需要您审核：</p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">来自：<strong style="color: #374151;">${authorName}</strong></p>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${content.length > 200 ? content.slice(0, 200) + '...' : content}</p>
          </div>
          <a href="${reviewUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 8px;">
            前往审核
          </a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send review notification email:', error);
    }
}

export async function sendCommentNotification(postTitle: string, content: string, authorName: string, recipientEmail: string) {
    const settings = await getSettings();
    if (!recipientEmail) return;

    try {
        const transporter = await createTransporter();
        const smtpUser = settings.smtp_user || process.env.SMTP_USER;
        const postUrl = `${settings.site_url}/admin/comments`;

        const mailOptions = {
            from: `"star和lemon的小站" <${smtpUser}>`,
            to: recipientEmail,
            subject: `【star和lemon的小站】你的文章收到了新评论`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316;">你的文章收到了新评论</h2>
          <p>文章《<strong>${postTitle}</strong>》有一条新评论：</p>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">来自：<strong style="color: #374151;">${authorName}</strong></p>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${content.length > 200 ? content.slice(0, 200) + '...' : content}</p>
          </div>
          <a href="${postUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 8px;">
            前往审核
          </a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send comment notification email:', error);
    }
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
