'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { RiSaveLine, RiCloseLine } from '@remixicon/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingField {
  key: string;
  value: string;
  label: string;
}

interface GroupedSettings {
  [category: string]: SettingField[];
}

const categoryMeta: Record<string, { title: string; description: string; icon: string }> = {
  site: { title: '网站信息', description: '基本网站设置', icon: '🌐' },
  ipapi: { title: 'IP 查询', description: 'IPAPI IP 地址查询服务配置', icon: '📍' },
  mail: { title: '邮件服务', description: 'SMTP 邮件发送配置', icon: '📧' },
  summary: { title: '文章摘要', description: 'AI 文章摘要生成配置', icon: '📝' },
  ai: { title: 'AI 助手', description: '网站 AI 助手聊天功能配置', icon: '🤖' },
  oauth: { title: '第三方登录', description: 'QQ 等第三方登录配置', icon: '🔑' },
  oss: { title: '对象存储', description: '阿里云 OSS / ESA 配置', icon: '☁️' },
  pay: { title: '支付服务', description: '蓝兔支付配置', icon: '💳' },
  pricing: { title: '文件快传费用', description: '文件快传费用计算参数', icon: '💰' },
  convert: { title: '文件转换服务', description: '转换 API 及费用计算参数', icon: '📄' },
  douyin: { title: '抖音解析', description: '抖音视频解析接口配置', icon: '🎬' },
};

const secretKeys = ['smtp_pass', 'summary_api_key', 'assistant_llm_api_key', 'assistant_tts_api_key', 'qq_app_key', 'ceru_app_secret', 'oss_access_key_secret', 'lantu_key', 'convert_api_key', 'ipapi_is_key'];

const booleanKeys = ['comment_review', 'guestbook_review', 'quote_enabled', 'assistant_enabled'];

const textareaKeys = ['assistant_system_prompt'];

const colSpanMap: Record<string, string> = {
  assistant_enabled: 'col-span-6',
  assistant_llm_api_url: 'col-span-2',
  assistant_llm_model: 'col-span-2',
  assistant_llm_api_key: 'col-span-2',
  assistant_tts_api_url: 'col-span-2',
  assistant_tts_model: 'col-span-2',
  assistant_tts_api_key: 'col-span-2',
  assistant_system_prompt: 'col-span-6',
  summary_api_url: 'col-span-2',
  summary_api_model: 'col-span-2',
  summary_api_key: 'col-span-2',
  baidu_site_verification: 'col-span-2',
  bing_site_verification: 'col-span-2',
  google_site_verification: 'col-span-2',
};

const selectKeys: Record<string, { label: string; options: { value: string; label: string }[] }> = {
  douyin_embed_mode: {
    label: '嵌入方式',
    options: [
      { value: 'iframe', label: 'iframe 嵌入（推荐）' },
      { value: 'proxy', label: '代理播放' },
    ],
  },
};

const labelOverrides: Record<string, string> = {
  oss_region: 'OSS 地域',
  oss_endpoint: 'OSS Endpoint（可选）',
  oss_bucket: 'Bucket',
  oss_access_key_id: 'Access Key ID',
  oss_access_key_secret: 'Access Key Secret',
  esa_domain: 'ESA / CDN 域名（可选）',
};

const placeholderOverrides: Record<string, string> = {
  oss_region: 'oss-cn-hangzhou',
  oss_endpoint: '留空则按地域自动使用默认 Endpoint',
  oss_bucket: 'my-bucket',
  oss_access_key_id: 'LTAI...',
  oss_access_key_secret: 'Access Key Secret',
  esa_domain: 'cdn.star-lemon.top，不要带 https://',
};

const fieldOrder: Record<string, string[]> = {
  site: ['site_title', 'site_description', 'site_keywords', 'site_url', 'icp_number', 'comment_review', 'guestbook_review', 'quote_enabled', 'baidu_site_verification', 'bing_site_verification', 'google_site_verification'],
  ipapi: ['ipapi_is_key'],
  mail: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass'],
  summary: ['summary_api_url', 'summary_api_model', 'summary_api_key'],
  ai: ['assistant_enabled', 'assistant_llm_api_url', 'assistant_llm_model', 'assistant_llm_api_key', 'assistant_tts_api_url', 'assistant_tts_model', 'assistant_tts_api_key', 'assistant_system_prompt'],
  oauth: ['qq_app_id', 'qq_app_key', 'ceru_endpoint', 'ceru_app_id', 'ceru_app_secret'],
  oss: ['oss_endpoint', 'oss_region', 'oss_bucket', 'oss_access_key_id', 'oss_access_key_secret', 'esa_domain'],
  pay: ['lantu_mch_id', 'lantu_key'],
  pricing: ['ft_storage_price', 'ft_traffic_price', 'ft_payment_fee', 'ft_service_fee', 'ft_profit_rate'],
  convert: ['convert_api_url', 'convert_api_key', 'fc_price_per_file', 'fc_payment_fee', 'fc_service_fee', 'fc_profit_rate'],
  douyin: ['douyin_api_url', 'douyin_embed_mode'],
};

function isCategoryDirty(category: string, settings: GroupedSettings, original: GroupedSettings): boolean {
  const current = settings[category];
  const orig = original[category];
  if (!current || !orig) return false;
  if (current.length !== orig.length) return true;
  for (let i = 0; i < current.length; i++) {
    if (current[i].key !== orig[i].key || current[i].value !== orig[i].value) return true;
  }
  return false;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<GroupedSettings>({});
  const [originalSettings, setOriginalSettings] = useState<GroupedSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      setOriginalSettings(JSON.parse(JSON.stringify(data)));
    } catch {
      toast.error('获取设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category: string) => {
    setSaving(category);
    try {
      const flat: Record<string, string> = {};
      for (const field of settings[category]) {
        flat[field.key] = field.value;
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flat),
      });

      if (res.ok) {
        toast.success(`「${categoryMeta[category]?.title || category}」保存成功`);
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      } else {
        toast.error('保存失败');
      }
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(null);
    }
  };

  const handleCancelCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: JSON.parse(JSON.stringify(originalSettings[category])),
    }));
  };

  const handleChange = (category: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category].map(f => f.key === key ? { ...f, value } : f),
    }));
  };

  const handleSwitchChange = (category: string, key: string, checked: boolean) => {
    handleChange(category, key, checked ? 'true' : 'false');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const sortedCategories = Object.keys(settings).sort((a, b) => {
    const order = ['site', 'ipapi', 'mail', 'summary', 'ai', 'oauth', 'oss', 'pay', 'pricing', 'convert', 'douyin'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">全局配置</h1>
        <p className="text-muted-foreground mt-2">管理网站的所有配置项</p>
      </div>

      <div className="space-y-6">
        {sortedCategories.map((category) => {
          const meta = categoryMeta[category] || { title: category, description: '', icon: '⚙️' };
          const order = fieldOrder[category] || [];
          const fields = [...settings[category]].sort((a, b) => {
            const ia = order.indexOf(a.key);
            const ib = order.indexOf(b.key);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
          });
          const dirty = isCategoryDirty(category, settings, originalSettings);

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">{meta.icon}</span>
                  {meta.title}
                </CardTitle>
                <CardDescription>{meta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-4">
                  {fields.map((field) => {
                    const isBoolean = booleanKeys.includes(field.key);
                    const isSecret = secretKeys.includes(field.key);
                    const isSelect = selectKeys[field.key];
                    const isTextarea = textareaKeys.includes(field.key);
                    const displayLabel = labelOverrides[field.key] || field.label;
                    const placeholder = placeholderOverrides[field.key] || displayLabel;

                    if (isBoolean) {
                      const spanClass = colSpanMap[field.key] || 'col-span-1';
                      if (spanClass === 'col-span-6') {
                        return (
                          <div key={field.key} className={`${spanClass} flex items-center gap-3`}>
                            <Label>{displayLabel}</Label>
                            <Switch
                              size="sm"
                              checked={field.value === 'true'}
                              onCheckedChange={(checked) => handleSwitchChange(category, field.key, checked)}
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={field.key} className={`${spanClass} space-y-2`}>
                          <Label>{displayLabel}</Label>
                          <div className="h-9 flex items-center">
                            <Switch
                              size="sm"
                              checked={field.value === 'true'}
                              onCheckedChange={(checked) => handleSwitchChange(category, field.key, checked)}
                            />
                          </div>
                        </div>
                      );
                    }

                    if (isSelect) {
                      return (
                        <div key={field.key} className="col-span-3 space-y-2">
                          <Label>{isSelect.label}</Label>
                          <Select
                            value={field.value}
                            onValueChange={(val) => handleChange(category, field.key, val ?? '')}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {isSelect.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    if (isTextarea) {
                      return (
                        <div key={field.key} className={`${colSpanMap[field.key] || 'col-span-6'} space-y-2`}>
                          <Label>{displayLabel}</Label>
                          <Textarea
                            value={field.value}
                            onChange={(e) => handleChange(category, field.key, e.target.value)}
                            placeholder={placeholder}
                            rows={4}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={field.key} className={`${colSpanMap[field.key] || 'col-span-3'} space-y-2`}>
                        <Label>{displayLabel}</Label>
                        <Input
                          type={isSecret ? 'password' : 'text'}
                          value={field.value}
                          onChange={(e) => handleChange(category, field.key, e.target.value)}
                          placeholder={placeholder}
                        />
                      </div>
                    );
                  })}
                </div>
                {dirty && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button onClick={() => handleSaveCategory(category)} disabled={saving === category}>
                      <RiSaveLine className="w-4 h-4 mr-2" />
                      {saving === category ? '保存中...' : '保存'}
                    </Button>
                    <Button variant="outline" onClick={() => handleCancelCategory(category)} disabled={saving === category}>
                      <RiCloseLine className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
