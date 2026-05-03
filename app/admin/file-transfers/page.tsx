'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RiFileTransferLine, RiDeleteBinLine, RiMoneyCnyCircleLine, RiFileLine, RiDownloadLine, RiTimeLine } from '@remixicon/react';

interface FileTransfer {
  id: number;
  code: string;
  file_name: string;
  file_size: number;
  file_key: string | null;
  max_downloads: number;
  download_count: number;
  retain_days: number;
  expire_at: string;
  price: string;
  pay_status: string;
  pay_order_no: string | null;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  user_nickname: string | null;
  user_email: string | null;
}

interface OrderRecord {
  id: number;
  transfer_id: number | null;
  code: string;
  file_name: string;
  file_size: number;
  max_downloads: number;
  download_count: number;
  retain_days: number;
  price: string;
  pay_order_no: string | null;
  user_id: number | null;
  user_nickname: string | null;
  user_email: string | null;
  status: string;
  refund_amount: string;
  deleted_at: string | null;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function FileManagementTab() {
  const [files, setFiles] = useState<FileTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteFile, setDeleteFile] = useState<FileTransfer | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/admin/file-transfers');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
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
    if (!deleteFile) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/file-transfers/${deleteFile.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || '文件已删除');
        setDeleteFile(null);
        fetchFiles();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">共 {files.length} 个有效文件</div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无有效文件
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件</TableHead>
                  <TableHead>取件码</TableHead>
                  <TableHead>下载进度</TableHead>
                  <TableHead>到期时间</TableHead>
                  <TableHead>支付金额</TableHead>
                  <TableHead>上传用户</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RiFileLine className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm truncate max-w-[150px]">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-primary">{file.code}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RiDownloadLine className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{file.download_count} / {file.max_downloads}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RiTimeLine className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(file.expire_at).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">¥{parseFloat(file.price).toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      {file.user_nickname ? (
                        <div>
                          <p className="text-sm">{file.user_nickname}</p>
                          <p className="text-xs text-muted-foreground">{file.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">匿名</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteFile(file)}>
                        <RiDeleteBinLine className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteFile} onOpenChange={(open) => { if (!open) setDeleteFile(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <RiMoneyCnyCircleLine className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除并退款</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文件「{deleteFile?.file_name}」吗？系统将根据剩余下载次数和存储天数计算应退金额。
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
    </div>
  );
}

function OrderRecordsTab() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/file-transfers/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error('获取订单记录失败');
      }
    } catch {
      toast.error('获取订单记录失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (order: OrderRecord) => {
    if (order.status === 'refunded') {
      return <Badge variant="destructive">已退款</Badge>;
    }
    return <Badge variant="default">已完成</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">共 {orders.length} 笔订单</div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无订单记录
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>文件</TableHead>
                  <TableHead>取件码</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>支付金额</TableHead>
                  <TableHead>退款金额</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{order.pay_order_no || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[120px]">{order.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(order.file_size)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-sm">{order.code}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order)}</TableCell>
                    <TableCell className="text-sm font-medium">¥{parseFloat(order.price).toFixed(2)}</TableCell>
                    <TableCell className="text-sm">
                      {parseFloat(order.refund_amount) > 0 ? (
                        <span className="text-destructive font-medium">¥{parseFloat(order.refund_amount).toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.user_nickname ? (
                        <div>
                          <p className="text-sm">{order.user_nickname}</p>
                          <p className="text-xs text-muted-foreground">{order.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">匿名</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FileTransfersAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文件快传管理</h1>
      </div>

      <Tabs defaultValue="files">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="files" className="gap-1.5">
            <RiFileTransferLine className="w-4 h-4" />
            文件管理
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <RiMoneyCnyCircleLine className="w-4 h-4" />
            订单记录
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-4">
          <FileManagementTab />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <OrderRecordsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
