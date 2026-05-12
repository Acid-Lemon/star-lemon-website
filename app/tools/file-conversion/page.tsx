'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/app/components/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RiArrowLeftLine, RiFileLine, RiCloseLine, RiUploadCloudLine, RiWechatPayLine, RiCheckLine, RiDownloadLine, RiFolderLine, RiBillLine, RiRefreshLine, RiFilePdf2Line } from '@remixicon/react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

const SUPPORTED_FORMATS: { category: string; exts: string }[] = [
  { category: '图片', exts: '.jpg .jpeg .png .gif .bmp .tiff .webp' },
  { category: 'Word 文档', exts: '.doc .docx .dot .dotx .rtf .odt .txt .wps' },
  { category: 'Excel 表格', exts: '.xls .xlsx .xlsm .ods .csv .et' },
  { category: 'PPT 演示', exts: '.ppt .pptx .pps .ppsx .odp .dps' },
  { category: '其他', exts: '.pdf .html .htm' },
];

const ACCEPT_STRING = SUPPORTED_FORMATS.flatMap(f => f.exts.split(' ')).join(',');

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

type Step = 'form' | 'uploading' | 'converting' | 'paying' | 'done';

interface UserConversion {
  id: number;
  file_name: string;
  file_size: number;
  src_format: string;
  page_count: number | null;
  status: string;
  created_at: string;
  price: string | null;
  order_status: string | null;
}

interface UserOrder {
  id: number;
  file_name: string;
  file_size: number;
  page_count: number | null;
  price: string;
  pay_order_no: string | null;
  status: string;
  refund_amount: string;
  created_at: string;
}

function ConvertPanel() {
  const user = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [conversionId, setConversionId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [convertProgress, setConvertProgress] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [price, setPrice] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [autoPaying, setAutoPaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const conversionIdRef = useRef<number | null>(null);

  useEffect(() => { conversionIdRef.current = conversionId; }, [conversionId]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startConvertPolling = useCallback((cid: number) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/file-conversion/${cid}/status`);
        const data = await res.json();
        if (data.status === 'completed') {
          stopPolling();
          setPageCount(data.pageCount);
          setPrice(data.price);
          if (data.paid) {
            setStep('done');
          } else {
            setStep('paying');
          }
        } else if (data.status === 'failed') {
          stopPolling();
          toast.error('文件转换失败，请重试');
          setStep('form');
        } else if (data.status === 'converting') {
          setConvertProgress(data.progress || 0);
        }
      } catch {}
    }, 3000);
  }, [stopPolling]);

  const startPayPolling = useCallback((cid: number) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/file-conversion/${cid}/pay-status`);
        const data = await res.json();
        if (data.paid) {
          stopPolling();
          setAutoPaying(false);
          toast.success('支付成功！');
          setStep('done');
        }
      } catch {}
    }, 3000);
  }, [stopPolling]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const createRes = await fetch('/api/file-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        toast.error(createData.error || '创建失败');
        return;
      }

      setConversionId(createData.id);
      setStep('uploading');
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/file-conversion/${createData.id}/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          if (result.status === 'completed') {
            setPageCount(result.pageCount);
            setStep('paying');
            fetchPrice(createData.id);
          } else if (result.status === 'converting') {
            setStep('converting');
            setConvertProgress(0);
            startConvertPolling(createData.id);
          } else {
            toast.error('上传处理异常');
            setStep('form');
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            toast.error(err.error || '上传失败');
          } catch {
            toast.error('文件上传失败');
          }
          setStep('form');
        }
      };

      xhr.onerror = () => {
        toast.error('上传失败');
        setStep('form');
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    } catch {
      toast.error('操作失败');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async (cid: number) => {
    try {
      const res = await fetch(`/api/file-conversion/${cid}/status`);
      const data = await res.json();
      if (data.price !== undefined) {
        setPrice(data.price);
      }
    } catch {}
  };

  const handlePay = async () => {
    const cid = conversionIdRef.current;
    if (!cid) return;
    setLoading(true);
    try {
      const payRes = await fetch(`/api/file-conversion/${cid}/pay`, { method: 'POST' });
      const payData = await payRes.json();

      if (!payRes.ok) {
        toast.error(payData.error || '发起支付失败');
        return;
      }

      if (payData.paid) {
        toast.success(`已使用 ${payData.coinUsed} 星柠币抵扣`);
        setStep('done');
      } else if (payData.qrCodeUrl) {
        setPrice(payData.price || price);
        setQrCodeUrl(payData.qrCodeUrl);
        startPayPolling(cid);
      } else {
        toast.error('获取支付二维码失败');
      }
    } catch {
      toast.error('发起支付失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPaid = async () => {
    const cid = conversionIdRef.current;
    if (!cid) return;
    try {
      const res = await fetch(`/api/file-conversion/${cid}/pay-status`);
      const data = await res.json();
      if (data.paid) {
        stopPolling();
        toast.success('支付成功！');
        setStep('done');
      } else {
        toast.info('尚未检测到支付，请完成扫码支付后重试');
      }
    } catch {
      toast.error('查询支付状态失败');
    }
  };

  const handleDownload = async () => {
    const cid = conversionIdRef.current;
    if (!cid) return;
    try {
      const res = await fetch(`/api/file-conversion/${cid}/download`, { method: 'POST' });
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        toast.success('开始下载');
      } else {
        toast.error(data.error || '下载失败');
      }
    } catch {
      toast.error('下载失败');
    }
  };

  const handleReset = () => {
    stopPolling();
    setFile(null);
    setStep('form');
    setConversionId(null);
    setUploadProgress(0);
    setConvertProgress(0);
    setPageCount(0);
    setPrice(null);
    setQrCodeUrl('');
    setAutoPaying(false);
  };

  if (step === 'done') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiCheckLine className="w-5 h-5 text-green-500" />
            转换完成
          </CardTitle>
          <CardDescription>文件已成功转换为 PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件名</span>
              <span className="font-medium truncate max-w-[240px]">{file?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PDF 页数</span>
              <span>{pageCount} 页</span>
            </div>
            {price !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">已支付</span>
                <span className="text-primary">¥{price.toFixed(2)}</span>
              </div>
            )}
          </div>
          <Button className="w-full" size="lg" onClick={handleDownload}>
            <RiDownloadLine className="w-4 h-4 mr-2" />
            下载 PDF
          </Button>
          <Button variant="outline" className="w-full" onClick={handleReset}>
            继续转换
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'paying') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiWechatPayLine className="w-5 h-5 text-green-500" />
            支付下载
          </CardTitle>
          <CardDescription>转换完成，支付后即可下载 PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件名</span>
              <span className="font-medium truncate max-w-[200px]">{file?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PDF 页数</span>
              <span>{pageCount} 页</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t mt-1">
              <span>需支付</span>
              <span className="text-primary text-lg">¥{price?.toFixed(2)}</span>
            </div>
            {user && (
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">我的星柠币</span>
                <span className={user.sl_coin >= Math.ceil((price || 0) * 100) ? 'text-green-600' : 'text-orange-500'}>
                  {user.sl_coin} 枚 {user.sl_coin >= Math.ceil((price || 0) * 100) ? '（可抵扣）' : '（不足抵扣）'}
                </span>
              </div>
            )}
          </div>

          {qrCodeUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="border rounded-lg p-3 bg-white">
                <img src={qrCodeUrl} alt="支付二维码" width={200} height={200} />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">¥{price?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">微信扫码支付</p>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckPaid} disabled={autoPaying}>
                {autoPaying ? '检测中...' : '我已支付'}
              </Button>
            </div>
          ) : (
            <Button className="w-full" size="lg" onClick={handlePay} disabled={loading}>
              {loading ? '处理中...' : '立即支付'}
            </Button>
          )}

          <Button variant="outline" className="w-full" onClick={handleReset}>
            取消
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'converting') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiRefreshLine className="w-5 h-5 text-primary animate-spin" />
            正在转换
          </CardTitle>
          <CardDescription>{file?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">转换进度</span>
              <span className="font-mono">{convertProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${convertProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              文件正在服务器端转换，请稍候...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'uploading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiUploadCloudLine className="w-5 h-5 text-primary" />
            正在上传文件
          </CardTitle>
          <CardDescription>{file?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">上传进度</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiFilePdf2Line className="w-5 h-5" />
          转换为 PDF
        </CardTitle>
        <CardDescription>选择文件上传并转换为 PDF，按转换出的页数收费</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPT_STRING}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); }
            }}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <RiFileLine className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-2 p-1 rounded-full hover:bg-muted"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <RiUploadCloudLine className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">点击选择文件或拖拽到此处</p>
              <p className="text-xs text-muted-foreground mt-1">支持图片、Word、Excel、PPT、PDF、HTML 等格式</p>
            </>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">支持格式</p>
          <div className="space-y-1">
            {SUPPORTED_FORMATS.map((cat) => (
              <div key={cat.category} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground shrink-0 w-16">{cat.category}</span>
                <span className="text-muted-foreground/80">{cat.exts}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleSubmit} disabled={!file || loading}>
          {loading ? '处理中...' : '上传并转换'}
        </Button>
      </CardContent>
    </Card>
  );
}

function MyConversionsPanel({ refreshKey }: { refreshKey?: number }) {
  const [conversions, setConversions] = useState<UserConversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversions();
  }, [refreshKey]);

  const fetchConversions = async () => {
    try {
      const res = await fetch('/api/user/file-conversions');
      if (res.ok) {
        const data = await res.json();
        setConversions(data);
      } else if (res.status === 401) {
        setConversions([]);
      } else {
        toast.error('获取转换记录失败');
      }
    } catch {
      toast.error('获取转换记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (conversion: UserConversion) => {
    if (conversion.status === 'failed') return <Badge variant="destructive">失败</Badge>;
    if (conversion.status === 'converting') return <Badge variant="outline" className="text-blue-600 border-blue-300">转换中</Badge>;
    if (conversion.status === 'uploading') return <Badge variant="outline" className="text-yellow-600 border-yellow-300">上传中</Badge>;
    if (conversion.order_status === 'paid') return <Badge variant="default">已支付</Badge>;
    if (conversion.status === 'completed') return <Badge variant="outline" className="text-orange-600 border-orange-300">待支付</Badge>;
    return <Badge variant="secondary">{conversion.status}</Badge>;
  };

  const handleDownload = async (id: number) => {
    try {
      const res = await fetch(`/api/file-conversion/${id}/download`, { method: 'POST' });
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        toast.error(data.error || '下载失败');
      }
    } catch {
      toast.error('下载失败');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48">加载中...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiFolderLine className="w-5 h-5" />
          我的转换
        </CardTitle>
        <CardDescription>查看您的文件转换记录</CardDescription>
      </CardHeader>
      <CardContent>
        {conversions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            暂无转换记录，请先登录并转换文件
          </div>
        ) : (
          <div className="space-y-3">
            {conversions.map((conv) => (
              <div key={conv.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiFilePdf2Line className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm truncate max-w-[180px]">{conv.file_name}</span>
                  </div>
                  {getStatusBadge(conv)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatFileSize(conv.file_size)}</span>
                    {conv.page_count && <span>{conv.page_count} 页</span>}
                    <span>{new Date(conv.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  {conv.order_status === 'paid' && (
                    <button
                      onClick={() => handleDownload(conv.id)}
                      className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                      title="下载 PDF"
                    >
                      <RiDownloadLine className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyOrdersPanel({ refreshKey }: { refreshKey?: number }) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [refreshKey]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/file-conversions/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 401) {
        setOrders([]);
      } else {
        toast.error('获取订单记录失败');
      }
    } catch {
      toast.error('获取订单记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (order: UserOrder) => {
    if (order.status === 'refunded') return <Badge variant="destructive">已退款</Badge>;
    if (order.status === 'refunding') return <Badge variant="outline" className="text-orange-600 border-orange-300">待退款</Badge>;
    return <Badge variant="default">已完成</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-48">加载中...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiBillLine className="w-5 h-5" />
          我的订单
        </CardTitle>
        <CardDescription>查看您的转换支付订单</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            暂无订单记录
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiFilePdf2Line className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm truncate max-w-[180px]">{order.file_name || '(已删除)'}</span>
                  </div>
                  {getStatusBadge(order)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{order.page_count ? `${order.page_count} 页` : '-'}</span>
                  <span>¥{parseFloat(order.price).toFixed(2)}</span>
                  {parseFloat(order.refund_amount) > 0 && (
                    <span className="text-destructive">退 ¥{parseFloat(order.refund_amount).toFixed(2)}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FileConversionPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center pt-16 pb-10 gap-8 px-4 w-full">
      <div className="w-full max-w-5xl">
        <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <RiArrowLeftLine className="w-4 h-4" />
          返回工具箱
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="text-center space-y-3 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">文件转换</h1>
              <p className="text-muted-foreground">将各种格式文件转换为 PDF，按页数收费</p>
            </div>
            <ConvertPanel />
            <div className="text-xs text-muted-foreground text-center space-y-1 mt-6">
              <p>文件转换由服务器端处理，转换完成后按 PDF 页数计费</p>
              <p>1 星柠币 = 0.01 元，可抵扣转换费用</p>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <MyConversionsPanel refreshKey={refreshKey} />
            <MyOrdersPanel refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
