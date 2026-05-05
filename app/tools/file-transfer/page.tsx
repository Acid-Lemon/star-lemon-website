'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import { RiUploadCloudLine, RiDownloadLine, RiFileLine, RiCloseLine, RiArrowRightLine, RiArrowLeftLine, RiWechatPayLine, RiCheckLine, RiFolderLine, RiBillLine, RiTimeLine, RiDeleteBinLine } from '@remixicon/react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

type Step = 'form' | 'paying' | 'uploading' | 'done';

interface UserFile {
  id: number;
  code: string;
  file_name: string;
  file_size: number;
  max_downloads: number;
  download_count: number;
  retain_days: number;
  expire_at: string;
  price: string;
  created_at: string;
}

interface UserOrder {
  id: number;
  transfer_id: number | null;
  code: string | null;
  file_name: string | null;
  file_size: number | null;
  max_downloads: number | null;
  download_count: number | null;
  retain_days: number | null;
  price: string | null;
  pay_order_no: string | null;
  status: string;
  refund_amount: string;
  created_at: string;
}

function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [maxDownloads, setMaxDownloads] = useState(3);
  const [retainDays, setRetainDays] = useState(7);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoUploading, setAutoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback((id: number) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/file-transfer/${id}/pay-status`);
        const data = await res.json();
        if (data.paid) {
          stopPolling();
          setAutoUploading(true);
          toast.success('支付成功，正在上传文件...');
          handleUploadAfterPayInternal(id);
        }
      } catch {}
    }, 3000);
  }, [stopPolling]);

  const handleUploadAfterPayInternal = (oid: number) => {
    if (!file) return;
    setStep('uploading');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/file-transfer/${oid}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setAutoUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        setStep('done');
        toast.success('文件上传成功！');
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          toast.error(err.error || '上传失败');
        } catch {
          toast.error('文件上传失败');
        }
      }
    };

    xhr.onerror = () => {
      setAutoUploading(false);
      toast.error('上传失败');
    };

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  };

  const handleCalcPrice = async () => {
    if (!file) return;
    try {
      const res = await fetch('/api/file-transfer/calc-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileSize: file.size, retainDays, maxDownloads }),
      });
      const data = await res.json();
      if (data.price !== undefined) {
        setPrice(data.price);
      } else {
        toast.error(data.error || '计算价格失败');
      }
    } catch {
      toast.error('计算价格失败');
    }
  };

  const handleSubmit = async () => {
    if (!file || !price) {
      toast.error('请先选择文件并计算费用');
      return;
    }
    setLoading(true);
    try {
      const createRes = await fetch('/api/file-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          maxDownloads,
          retainDays,
        }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        toast.error(createData.error || '创建失败');
        return;
      }

      setOrderId(createData.id);
      setCode(createData.code);

      const payRes = await fetch(`/api/file-transfer/${createData.id}/pay`, { method: 'POST' });
      const payData = await payRes.json();

      if (!payRes.ok) {
        toast.error(payData.error || '发起支付失败');
        return;
      }

      if (payData.qrCodeUrl) {
        setQrCodeUrl(payData.qrCodeUrl);
        setStep('paying');
        startPolling(createData.id);
      } else {
        toast.error('获取支付二维码失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPaid = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/file-transfer/${orderId}/pay-status`);
      const data = await res.json();
      if (data.paid) {
        stopPolling();
        toast.success('支付成功！');
        handleUploadAfterPayInternal(orderId);
      } else {
        toast.info('尚未检测到支付，请完成扫码支付后重试');
      }
    } catch {
      toast.error('查询支付状态失败');
    }
  };

  const handleReset = () => {
    stopPolling();
    setFile(null);
    setPrice(null);
    setStep('form');
    setOrderId(null);
    setCode('');
    setQrCodeUrl('');
    setUploadProgress(0);
    setAutoUploading(false);
  };

  if (step === 'done') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiCheckLine className="w-5 h-5 text-green-500" />
            上传成功
          </CardTitle>
          <CardDescription>文件已上传，可分享取件码给他人下载</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">您的取件码</p>
            <p className="text-4xl font-mono font-bold tracking-[0.3em] text-primary">{code}</p>
            <p className="text-sm text-muted-foreground">请妥善保存，分享此码即可下载文件</p>
          </div>
          <Button variant="outline" className="w-full" onClick={handleReset}>
            继续上传
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
            微信扫码支付
          </CardTitle>
          <CardDescription>请使用微信扫描下方二维码完成支付</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            {qrCodeUrl && (
              <div className="border rounded-lg p-3 bg-white">
                <img src={qrCodeUrl} alt="支付二维码" width={200} height={200} />
              </div>
            )}
            <div className="text-center">
              <p className="text-lg font-medium">¥{price?.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">取件码: {code}</p>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleCheckPaid} disabled={autoUploading}>
            {autoUploading ? '正在上传...' : '我已支付，上传文件'}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleReset}>
            取消
          </Button>
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
            <p className="text-xs text-muted-foreground text-center">
              {file ? `${formatFileSize(file.size)}` : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiUploadCloudLine className="w-5 h-5" />
          上传文件
        </CardTitle>
        <CardDescription>选择文件并支付费用后上传，生成取件码供他人下载</CardDescription>
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
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setPrice(null); }
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
                onClick={(e) => { e.stopPropagation(); setFile(null); setPrice(null); }}
                className="ml-2 p-1 rounded-full hover:bg-muted"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <RiUploadCloudLine className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">点击选择文件</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>下载次数</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={maxDownloads}
              onChange={(e) => { setMaxDownloads(parseInt(e.target.value) || 1); setPrice(null); }}
            />
          </div>
          <div className="space-y-2">
            <Label>保留天数</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={retainDays}
              onChange={(e) => { setRetainDays(parseInt(e.target.value) || 1); setPrice(null); }}
            />
          </div>
        </div>

        {price === null && file && (
          <Button variant="outline" className="w-full" onClick={handleCalcPrice}>
            计算费用
          </Button>
        )}

        {price !== null && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件大小</span>
              <span>{formatFileSize(file!.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">下载次数</span>
              <span>{maxDownloads} 次</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">保留天数</span>
              <span>{retainDays} 天</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t mt-1">
              <span>需支付</span>
              <span className="text-primary text-lg">¥{price.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button className="w-full" onClick={handleSubmit} disabled={!file || !price || loading}>
          {loading ? '处理中...' : '微信扫码支付'}
        </Button>
      </CardContent>
    </Card>
  );
}

function DownloadPanel() {
  const [code, setCode] = useState('');
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleQuery = async () => {
    if (!code.trim()) {
      toast.error('请输入取件码');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/file-transfer?code=${code.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setFileInfo(data);
      } else {
        toast.error(data.error || '查询失败');
        setFileInfo(null);
      }
    } catch {
      toast.error('查询失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/file-transfer/${fileInfo.id}/download`, { method: 'POST' });
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        toast.success('开始下载');
        setFileInfo(null);
        setCode('');
      } else {
        toast.error(data.error || '下载失败');
      }
    } catch {
      toast.error('下载失败');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiDownloadLine className="w-5 h-5" />
          取件下载
        </CardTitle>
        <CardDescription>输入六位取件码下载文件</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>取件码</Label>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="输入6位数字取件码"
              className="font-mono text-lg tracking-[0.3em] text-center"
              maxLength={6}
            />
            <Button onClick={handleQuery} disabled={code.length !== 6 || loading}>
              <RiArrowRightLine className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {fileInfo && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件名</span>
              <span className="font-medium truncate max-w-[200px]">{fileInfo.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">文件大小</span>
              <span>{formatFileSize(fileInfo.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">剩余下载次数</span>
              <span>{fileInfo.maxDownloads - fileInfo.downloadCount} / {fileInfo.maxDownloads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">到期时间</span>
              <span>{new Date(fileInfo.expireAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {fileInfo && (
          <Button className="w-full" size="lg" onClick={handleDownload} disabled={downloading}>
            {downloading ? '获取下载链接...' : '下载文件'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MyFilesPanel() {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/user/file-transfers');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      } else if (res.status === 401) {
        setFiles([]);
      } else {
        toast.error('获取文件列表失败');
      }
    } catch {
      toast.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/file-transfers/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || '已删除');
        setFiles(prev => prev.filter(f => f.id !== deleteTarget.id));
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
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
          我的文件
        </CardTitle>
        <CardDescription>查看您上传的有效文件</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            暂无有效文件，请先登录并上传文件
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiFileLine className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm truncate max-w-[180px]">{file.file_name}</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{file.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span className="flex items-center gap-1">
                      <RiDownloadLine className="w-3 h-3" />
                      {file.download_count} / {file.max_downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <RiTimeLine className="w-3 h-3" />
                      {new Date(file.expire_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(file)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="删除并退款"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <RiDeleteBinLine className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除并退款</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文件「{deleteTarget?.file_name}」吗？系统将根据剩余下载次数和存储天数计算应退金额。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '处理中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function MyOrdersPanel() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/file-transfers/orders');
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
    if (order.status === 'refunded') {
      return <Badge variant="destructive">已退款</Badge>;
    }
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
        <CardDescription>查看您的所有支付订单</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            暂无订单记录，请先登录并上传文件
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RiFileLine className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm truncate max-w-[180px]">{order.file_name || '(已删除)'}</span>
                  </div>
                  {getStatusBadge(order)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{order.file_size ? formatFileSize(order.file_size) : '-'}</span>
                  <span className="font-mono">{order.code || '-'}</span>
                  <span>¥{order.price ? parseFloat(order.price).toFixed(2) : '0.00'}</span>
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

export default function FileTransferPage() {
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
              <h1 className="text-3xl font-bold tracking-tight">文件快传</h1>
              <p className="text-muted-foreground">上传文件生成取件码，输入取件码即可下载</p>
            </div>
            <Tabs defaultValue="download">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="download">取件下载</TabsTrigger>
                <TabsTrigger value="upload">上传文件</TabsTrigger>
              </TabsList>
              <TabsContent value="download" className="mt-4">
                <DownloadPanel />
              </TabsContent>
              <TabsContent value="upload" className="mt-4">
                <UploadPanel />
              </TabsContent>
            </Tabs>
            <div className="text-xs text-muted-foreground text-center space-y-1 mt-6">
              <p>文件上传至阿里云 OSS，通过 ESA 加速下载</p>
              <p>下载次数耗尽或超过保留天数，文件将自动删除</p>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <MyFilesPanel />
            <MyOrdersPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
