'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STEPS = [
  { title: '创建管理员', desc: '设置你的管理员账户' },
  { title: '网站信息', desc: '配置网站基本信息' },
  { title: '服务配置', desc: '可选，也可以稍后在后台配置' },
];

export default function SetupWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [admin, setAdmin] = useState({ nickname: '', email: '', password: '' });
  const [site, setSite] = useState({ site_title: '', site_description: '', site_keywords: '', site_url: '', icp_number: '' });
  const [services, setServices] = useState({
    smtp_host: '', smtp_port: '465', smtp_user: '', smtp_pass: '',
    oss_endpoint: '', oss_region: '', oss_bucket: '', oss_access_key_id: '', oss_access_key_secret: '', esa_domain: '',
  });

  async function handleFinish() {
    setError('');
    setLoading(true);
    try {
      const settings: Record<string, string> = {};
      for (const [k, v] of Object.entries(site)) { if (v) settings[k] = v; }
      for (const [k, v] of Object.entries(services)) { if (v) settings[k] = v; }

      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...admin, settings }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '初始化失败');
        return;
      }
      window.location.href = '/admin';
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  function canNext() {
    if (step === 0) return admin.nickname && admin.email && admin.password.length >= 6;
    return true;
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{STEPS[step].title}</DialogTitle>
          <DialogDescription>{STEPS[step].desc}</DialogDescription>
          {/* Step indicator */}
          <div className="flex gap-1.5 pt-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : i < step ? 'w-4 bg-primary/60' : 'w-4 bg-muted'}`} />
            ))}
          </div>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-nickname">昵称</Label>
              <Input id="s-nickname" value={admin.nickname} onChange={e => setAdmin(a => ({ ...a, nickname: e.target.value }))} placeholder="管理员昵称" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-email">邮箱</Label>
              <Input id="s-email" type="email" value={admin.email} onChange={e => setAdmin(a => ({ ...a, email: e.target.value }))} placeholder="admin@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-password">密码</Label>
              <Input id="s-password" type="password" value={admin.password} onChange={e => setAdmin(a => ({ ...a, password: e.target.value }))} placeholder="至少6位" required minLength={6} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-title">网站标题</Label>
              <Input id="s-title" value={site.site_title} onChange={e => setSite(s => ({ ...s, site_title: e.target.value }))} placeholder="star和lemon的小站" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-desc">网站描述</Label>
              <Input id="s-desc" value={site.site_description} onChange={e => setSite(s => ({ ...s, site_description: e.target.value }))} placeholder="欢迎访问我们的小站~！" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-keywords">网站关键词</Label>
              <Input id="s-keywords" value={site.site_keywords} onChange={e => setSite(s => ({ ...s, site_keywords: e.target.value }))} placeholder="关键词,逗号分隔" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-url">网站地址</Label>
              <Input id="s-url" value={site.site_url} onChange={e => setSite(s => ({ ...s, site_url: e.target.value }))} placeholder="https://star-lemon.top" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-icp">ICP备案号</Label>
              <Input id="s-icp" value={site.icp_number} onChange={e => setSite(s => ({ ...s, icp_number: e.target.value }))} placeholder="闽ICP备xxxxxxx号" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">邮件服务 (SMTP)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>服务器</Label>
                  <Input value={services.smtp_host} onChange={e => setServices(s => ({ ...s, smtp_host: e.target.value }))} placeholder="smtp.example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>端口</Label>
                  <Input value={services.smtp_port} onChange={e => setServices(s => ({ ...s, smtp_port: e.target.value }))} placeholder="465" />
                </div>
                <div className="space-y-1.5">
                  <Label>用户</Label>
                  <Input value={services.smtp_user} onChange={e => setServices(s => ({ ...s, smtp_user: e.target.value }))} placeholder="noreply@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>密码</Label>
                  <Input type="password" value={services.smtp_pass} onChange={e => setServices(s => ({ ...s, smtp_pass: e.target.value }))} placeholder="SMTP密码" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">对象存储 (OSS)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Endpoint</Label>
                  <Input value={services.oss_endpoint} onChange={e => setServices(s => ({ ...s, oss_endpoint: e.target.value }))} placeholder="oss-cn-hangzhou.aliyuncs.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Region</Label>
                  <Input value={services.oss_region} onChange={e => setServices(s => ({ ...s, oss_region: e.target.value }))} placeholder="cn-hangzhou" />
                </div>
                <div className="space-y-1.5">
                  <Label>Bucket</Label>
                  <Input value={services.oss_bucket} onChange={e => setServices(s => ({ ...s, oss_bucket: e.target.value }))} placeholder="my-bucket" />
                </div>
                <div className="space-y-1.5">
                  <Label>Access Key ID</Label>
                  <Input value={services.oss_access_key_id} onChange={e => setServices(s => ({ ...s, oss_access_key_id: e.target.value }))} placeholder="LTAI..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Access Key Secret</Label>
                  <Input type="password" value={services.oss_access_key_secret} onChange={e => setServices(s => ({ ...s, oss_access_key_secret: e.target.value }))} placeholder="OSS密钥" />
                </div>
                <div className="space-y-1.5">
                  <Label>ESA域名</Label>
                  <Input value={services.esa_domain} onChange={e => setServices(s => ({ ...s, esa_domain: e.target.value }))} placeholder="cdn.star-lemon.top" />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>上一步</Button>
          )}
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>下一步</Button>
          )}
          {step === STEPS.length - 1 && (
            <>
              <Button variant="outline" onClick={handleFinish} disabled={loading}>跳过，稍后配置</Button>
              <Button onClick={handleFinish} disabled={loading}>{loading ? '正在初始化...' : '完成初始化'}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}