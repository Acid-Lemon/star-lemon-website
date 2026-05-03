import React from 'react';
import db from '../../../lib/db';
import { revalidatePath } from 'next/cache';
import { deleteUploadedFile } from '../../../lib/file';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiCheckLine, RiCloseLine, RiDeleteBinLine, RiTimeLine, RiCheckboxCircleLine, RiCloseCircleLine } from '@remixicon/react';

export const revalidate = 0;

async function updateMessageStatus(formData: FormData) {
    'use server';
    const id = formData.get('id');
    const status = formData.get('status'); // 'approved' or 'rejected'
    if (!id || !status) return;

    try {
        await db.query('UPDATE messages SET status = $1 WHERE id = $2', [status, id]);
        revalidatePath('/admin/messages');
        revalidatePath('/guestbook');
    } catch (e) {
        console.error(e);
    }
}

async function deleteMessage(formData: FormData) {
    'use server';
    const id = formData.get('id');
    if (!id) return;

    try {
        // 查询图片 URL
        const result = await db.query('SELECT image_url FROM messages WHERE id = $1', [id]);
        const imageUrl = result.rows[0]?.image_url;

        await db.query('DELETE FROM messages WHERE id = $1', [id]);

        // 删除关联的图片文件
        await deleteUploadedFile(imageUrl);

        revalidatePath('/admin/messages');
        revalidatePath('/guestbook');
    } catch (e) {
        console.error(e);
    }
}

export default async function AdminMessages() {
    let messages: any[] = [];
    try {
        const result = await db.query(`
            SELECT messages.*, users.nickname as author_name 
            FROM messages 
            JOIN users ON messages.user_id = users.id 
            ORDER BY created_at DESC
        `);
        messages = result.rows;
    } catch (e) {
        console.error(e);
    }

    const pendingCount = messages.filter(m => m.status === 'pending').length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">留言审核</h1>
                    <p className="text-muted-foreground mt-2">审批并管理来自访客的留言请求</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>全部留言</CardTitle>
                            <CardDescription>
                                共 {messages.length} 条记录，其中待审核 {pendingCount} 条
                            </CardDescription>
                        </div>
                        {pendingCount > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                <RiTimeLine className="w-3 h-3 mr-1" />
                                {pendingCount} 待处理
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">暂无任何留言记录</div>
                        ) : (
                            messages.map(msg => {
                                const isPending = msg.status === 'pending';
                                const isApproved = msg.status === 'approved';
                                
                                return (
                                    <div key={msg.id} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-lg border shadow-sm transition-colors ${
                                        isPending ? 'bg-yellow-50/30 border-yellow-200/50' : 
                                        isApproved ? 'bg-background border-border' : 
                                        'bg-muted/30 border-border opacity-70'
                                    }`}>
                                        
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">{msg.author_name || '佚名'}</span>
                                                    {isPending && <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 flex items-center"><RiTimeLine className="w-3 h-3 mr-1"/>待审核</Badge>}
                                                    {isApproved && <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 flex items-center"><RiCheckboxCircleLine className="w-3 h-3 mr-1"/>已通过</Badge>}
                                                    {!isPending && !isApproved && <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 flex items-center"><RiCloseCircleLine className="w-3 h-3 mr-1"/>已拒绝</Badge>}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/90 leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4">
                                            {isPending && (
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <form action={updateMessageStatus} className="flex-1 sm:flex-none">
                                                        <input type="hidden" name="id" value={msg.id} />
                                                        <input type="hidden" name="status" value="approved" />
                                                        <Button type="submit" size="sm" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                                                            <RiCheckLine className="w-4 h-4 mr-1" />
                                                            通过
                                                        </Button>
                                                    </form>
                                                    <form action={updateMessageStatus} className="flex-1 sm:flex-none">
                                                        <input type="hidden" name="id" value={msg.id} />
                                                        <input type="hidden" name="status" value="rejected" />
                                                        <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
                                                            <X className="w-4 h-4 mr-1" />
                                                            拒绝
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                            <form action={deleteMessage} className="ml-auto sm:ml-0">
                                                <input type="hidden" name="id" value={msg.id} />
                                                <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                    <RiDeleteBinLine className="w-4 h-4 mr-1" />
                                                    删除记录
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}