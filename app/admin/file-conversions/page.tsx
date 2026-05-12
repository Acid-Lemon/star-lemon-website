'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RiFilePdf2Line, RiDeleteBinLine, RiMoneyCnyCircleLine, RiFileLine, RiTimeLine } from '@remixicon/react';

interface FileConversion {
  id: number;
  file_name: string;
  file_size: number;
  src_format: string;
  task_id: string | null;
  page_count: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  user_nickname: string | null;
  user_email: string | null;
  price: string | null;
  order_status: string | null;
  pay_order_no: string | null;
}

interface OrderRecord {
  id: number;
  conversion_id: number | null;
  file_name: string | null;
  file_size: number | null;
  page_count: number | null;
  src_format: string | null;
  price: string;
  pay_order_no: string | null;
  user_nickname: string | null;
  user_email: string | null;
  status: string;
  refund_amount: string;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function ConversionManagementTab() {
  const [conversions, setConversions] = useState<FileConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<FileConversion | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = async () => {
    try {
      const res = await fetch('/api/admin/file-conversions');
      if (res.ok) {
        const data = await res.json();
        setConversions(data);
      } else {
        toast.error('获取转换列表失败');
      }
    } catch {
      toast.error('获取转换列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/file-conversions/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || '已删除');
        setDeleteTarget(null);
        fetchConversions();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (conv: FileConversion) => {
    if (conv.status === 'failed') return <Badge variant="destructive">失败</Badge>;
    if (conv.status === 'converting') return <Badge variant="outline" className="text-blue-600 border-blue-300">转换中</Badge>;
    if (conv.status === 'uploading') return <Badge variant="outline" className="text-yellow-600 border-yellow-300">上传中</Badge>;
    if (conv.order_status === 'paid') return <Badge variant="default">已支付</Badge>;
    if (conv.status === 'completed') return <Badge variant="outline" className="text-orange-600 border-orange-300">待支付</Badge>;
    return <Badge variant="secondary">{conv.status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">共 {conversions.length} 条转换记录</div>

      {conversions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无转换记录
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件</TableHead>
                  <TableHead>源格式</TableHead>
                  <TableHead>页数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>支付金额</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RiFilePdf2Line className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm truncate max-w-[150px]">{conv.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(conv.file_size)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{conv.src_format}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{conv.page_count ?? '-'}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(conv)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">¥{conv.price ? parseFloat(conv.price).toFixed(2) : '0.00'}</span>
                    </TableCell>
                    <TableCell>
                      {conv.user_nickname ? (
                        <div>
                          <p className="text-sm">{conv.user_nickname}</p>
                          <p className="text-xs text-muted-foreground">{conv.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RiTimeLine className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(conv.created_at).toLocaleString('zh-CN')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(conv)}>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <RiDeleteBinLine className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除转换记录「{deleteTarget?.file_name}」吗？相关文件和订单也将被删除。
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
      const res = await fetch('/api/admin/file-conversions/orders');
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
    if (order.status === 'refunding') {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">待退款</Badge>;
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
                  <TableHead>页数</TableHead>
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
                        <p className="font-medium text-sm truncate max-w-[120px]">{order.file_name || '(已删除)'}</p>
                        <p className="text-xs text-muted-foreground">{order.file_size ? formatFileSize(order.file_size) : '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.page_count ?? '-'}</span>
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
                        <span className="text-sm text-muted-foreground">-</span>
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

export default function FileConversionsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文件转换管理</h1>
      </div>

      <Tabs defaultValue="conversions">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="conversions" className="gap-1.5">
            <RiFilePdf2Line className="w-4 h-4" />
            转换记录
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <RiMoneyCnyCircleLine className="w-4 h-4" />
            订单记录
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversions" className="mt-4">
          <ConversionManagementTab />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <OrderRecordsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
