'use client';

import {useState, useRef, useCallback, useEffect} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {DatePicker} from '@/components/ui/date-picker';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose} from '@/components/ui/dialog';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {RiLockLine, RiMailLine, RiArrowRightSLine, RiQqFill, RiLinksLine} from '@remixicon/react';

import {UserInfo} from './user-context';
import {CaptchaInput} from './captcha-input';

interface UserProfileModalProps {
    user: UserInfo | null;
    onClose: () => void;
    onUpdate?: (updatedUser: any) => void;
}

export function UserProfileModal({user, onClose, onUpdate}: UserProfileModalProps) {
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [birthday, setBirthday] = useState(user?.birthday ? (() => { const d = new Date(user.birthday); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [showCropper, setShowCropper] = useState(false);
    const [cropImage, setCropImage] = useState<string>('');
    const cropCanvasRef = useRef<HTMLCanvasElement>(null);
    const cropImageRef = useRef<HTMLImageElement>(null);
    const [cropData, setCropData] = useState({ x: 0, y: 0, size: 0 });
    const [cropScale, setCropScale] = useState(1);
    const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
    const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startX0: 0, startY0: 0 });
    const cropViewSize = 256;

    const fitScale = cropData.size > 0 ? cropViewSize / cropData.size : 1;
    const displayScale = fitScale * cropScale;

    const handleCropPointerDown = (e: React.PointerEvent) => {
        const imgEl = cropImageRef.current;
        if (!imgEl) return;
        dragRef.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            startX0: cropData.x,
            startY0: cropData.y,
        };
        imgEl.setPointerCapture(e.pointerId);
        e.preventDefault();
    };

    const handleCropPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current.dragging) return;
        const d = dragRef.current;
        const dx = (e.clientX - d.startX) / displayScale;
        const dy = (e.clientY - d.startY) / displayScale;
        const imgEl = cropImageRef.current;
        if (!imgEl) return;
        const maxX = imgEl.naturalWidth - cropData.size;
        const maxY = imgEl.naturalHeight - cropData.size;
        setCropData(prev => ({
            ...prev,
            x: Math.max(0, Math.min(d.startX0 - dx, maxX)),
            y: Math.max(0, Math.min(d.startY0 - dy, maxY)),
        }));
    };

    const handleCropPointerUp = () => {
        dragRef.current.dragging = false;
    };

    const handleCropWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        setCropScale(prev => Math.max(1, Math.min(3, prev + delta)));
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        setNickname(user?.nickname || '');
        setAvatar(user?.avatar || '');
        setBio(user?.bio || '');
        setBirthday(user?.birthday ? (() => { const d = new Date(user.birthday); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })() : '');
        setPendingFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
        }
    }, [user]);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [securityAction, setSecurityAction] = useState<'password' | 'email' | null>(null);
    const [qqUnbinding, setQqUnbinding] = useState(false);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setCropImage(event.target?.result as string);
                setImgNatural({ w: img.width, h: img.height });
                const minDim = Math.min(img.width, img.height);
                setCropData({
                    x: (img.width - minDim) / 2,
                    y: (img.height - minDim) / 2,
                    size: minDim,
                });
                setCropScale(1);
                setShowCropper(true);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleCropConfirm = useCallback(async () => {
        if (!cropImage || !cropCanvasRef.current) return;

        try {
            const img = new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = cropImage;
            });

            const loadedImg = await img;
            const canvas = cropCanvasRef.current;
            canvas.width = 200;
            canvas.height = 200;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(loadedImg, cropData.x, cropData.y, cropData.size, cropData.size, 0, 0, 200, 200);

            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b);
                }, 'image/png');
            });

            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const objectUrl = URL.createObjectURL(blob);
            setPreviewUrl(objectUrl);
            setPendingFile(new File([blob], 'avatar.png', { type: 'image/png' }));
            setShowCropper(false);
            setCropImage('');
        } catch {
            toast.error('裁剪失败');
        }
    }, [cropImage, cropData, previewUrl]);

    const handleProfileSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            toast.error('昵称不能为空');
            return;
        }

        setProfileLoading(true);
        try {
            let newAvatarUrl = avatar;

            if (pendingFile) {
                setUploading(true);
                const formData = new FormData();
                formData.append('file', pendingFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                setUploading(false);
                if (!uploadRes.ok) {
                    toast.error('头像上传失败');
                    setProfileLoading(false);
                    return;
                }
                const uploadData = await uploadRes.json();
                newAvatarUrl = uploadData.url;

                if (avatar) {
                    await fetch(`/api/upload?key=${encodeURIComponent(avatar)}`, { method: 'DELETE' });
                }
            }

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    nickname: nickname.trim(),
                    avatar: newAvatarUrl || null,
                    bio: bio.trim() || null,
                    birthday: birthday || null,
                }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                toast.success('资料更新成功');
                onUpdate?.(updatedUser);
                onClose();
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || '更新失败');
            }
        } catch {
            toast.error('更新失败，请重试');
        } finally {
            setProfileLoading(false);
            setUploading(false);
        }
    }, [nickname, avatar, bio, birthday, pendingFile, previewUrl, onClose, onUpdate]);

    const handleSendEmailCode = async () => {
        if (!newEmail) {
            toast.error('请输入新邮箱地址');
            return;
        }
        if (!captchaText) {
            toast.error('请先填写图形验证码');
            return;
        }

        setSendingCode(true);
        try {
            const res = await fetch('/api/user/send-email-code', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: newEmail, captchaToken, captchaText}),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('验证码已发送');
                setCountdown(60);
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                toast.error(data.error || '发送失败');
            }
        } catch {
            toast.error('发送失败，请重试');
        } finally {
            setSendingCode(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error('请填写完整信息');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('两次输入的密码不一致');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('新密码至少 6 位');
            return;
        }

        setSecurityLoading(true);
        try {
            const res = await fetch('/api/user/security', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'password', newPassword}),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('密码修改成功');
                setNewPassword('');
                setConfirmPassword('');
                setSecurityAction(null);
            } else {
                toast.error(data.error || '修改失败');
            }
        } catch {
            toast.error('修改失败，请重试');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !emailCode) {
            toast.error('请填写完整信息');
            return;
        }

        setSecurityLoading(true);
        try {
            const res = await fetch('/api/user/security', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({action: 'email', newEmail, code: emailCode}),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('邮箱修改成功');
                setNewEmail('');
                setEmailCode('');
                setSecurityAction(null);
                onUpdate?.(data);
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.error || '修改失败');
            }
        } catch {
            toast.error('修改失败，请重试');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleQqUnbind = async () => {
        setQqUnbinding(true);
        try {
            const res = await fetch('/api/user/qq/unbind', { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                toast.success('QQ已解绑');
                onUpdate?.({ ...user, qq_identifier: null });
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.error || '解绑失败');
            }
        } catch {
            toast.error('解绑失败，请重试');
        } finally {
            setQqUnbinding(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col" showCloseButton>
                <DialogHeader>
                    <DialogTitle>个人设置</DialogTitle>
                    <DialogDescription>管理你的个人资料和账号安全</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0">
                <Tabs defaultValue="profile" onValueChange={(v) => { if (v === 'security') setSecurityAction(null); }}>
                    <TabsList variant="line" className="w-full">
                        <TabsTrigger value="profile" className="flex-1">个人资料</TabsTrigger>
                        <TabsTrigger value="security" className="flex-1">账号与安全</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <form onSubmit={handleProfileSubmit} className="space-y-2 pt-2">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative group">
                                    <Avatar className="w-20 h-20">
                                        {(previewUrl || avatar) ? (
                                            <AvatarImage src={previewUrl || avatar} alt="头像" />
                                        ) : (
                                            <AvatarFallback className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold text-2xl">
                                                {nickname?.[0]?.toUpperCase() || user?.nickname?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
                                    >
                                        {uploading ? '上传中...' : '更换'}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {showCropper && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center">
                                    <div
                                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                        onClick={() => setShowCropper(false)}
                                    />
                                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
                                        <div className="border-b px-6 py-4 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">裁剪头像</h3>
                                            <button
                                                onClick={() => setShowCropper(false)}
                                                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <div className="relative w-64 h-64 mx-auto mb-4 overflow-hidden rounded-full" onWheel={handleCropWheel}>
                                                <img
                                                    ref={cropImageRef}
                                                    src={cropImage}
                                                    alt="裁剪原图"
                                                    className="max-w-none cursor-grab active:cursor-grabbing select-none"
                                                    style={{
                                                        position: 'absolute',
                                                        left: `-${cropData.x * displayScale}px`,
                                                        top: `-${cropData.y * displayScale}px`,
                                                        width: `${imgNatural.w * displayScale}px`,
                                                        height: `${imgNatural.h * displayScale}px`,
                                                        maxWidth: 'none',
                                                    }}
                                                    onPointerDown={handleCropPointerDown}
                                                    onPointerMove={handleCropPointerMove}
                                                    onPointerUp={handleCropPointerUp}
                                                    onWheel={handleCropWheel}
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none" />
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 text-center">
                                                拖拽移动 · 滚轮缩放
                                            </p>
                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowCropper(false)}
                                                    className="flex-1"
                                                >
                                                    取消
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleCropConfirm}
                                                    className="flex-1"
                                                >
                                                    确认裁剪
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <canvas ref={cropCanvasRef} className="hidden" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label>昵称</Label>
                                <Input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="请输入昵称"
                                    maxLength={50}
                                />
                                <p className="text-xs text-muted-foreground text-right">{nickname.length}/50</p>
                            </div>

                            <div className="space-y-1">
                                <Label>个性签名</Label>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="写点什么介绍自己..."
                                    maxLength={200}
                                    rows={2}
                                />
                                <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
                            </div>

                            <div className="space-y-1">
                                <Label>生日</Label>
                                <DatePicker
                                    value={birthday}
                                    onChange={setBirthday}
                                    placeholder="选择生日"
                                />
                            </div>

                            <DialogFooter>
                                <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
                                <Button type="submit" disabled={profileLoading || uploading}>
                                    {profileLoading ? '保存中...' : '保存'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="space-y-4 pt-4">
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="text-xs text-muted-foreground mb-1">当前邮箱</p>
                                <p className="text-sm font-medium">{user?.email}</p>
                            </div>

                            {securityAction === 'password' ? (
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>新密码</Label>
                                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少 6 位" minLength={6} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>确认新密码</Label>
                                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" minLength={6} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setSecurityAction(null)}>取消</Button>
                                        <Button type="submit" disabled={securityLoading}>
                                            {securityLoading ? '修改中...' : '确认修改'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : securityAction === 'email' ? (
                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>新邮箱</Label>
                                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="your.email@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>图形验证码</Label>
                                        <CaptchaInput
                                            value={captchaText}
                                            onChange={setCaptchaText}
                                            onTokenChange={setCaptchaToken}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>验证码</Label>
                                        <div className="flex gap-2">
                                            <Input value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="6位验证码" className="flex-1" />
                                            <Button type="button" variant="outline" onClick={handleSendEmailCode} disabled={sendingCode || countdown > 0} className="shrink-0">
                                                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                                            </Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setSecurityAction(null)}>取消</Button>
                                        <Button type="submit" disabled={securityLoading}>
                                            {securityLoading ? '修改中...' : '确认修改'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto bg-muted/50 hover:bg-muted rounded-xl" onClick={() => setSecurityAction('password')}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <RiLockLine className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium">修改密码</p>
                                                <p className="text-xs text-muted-foreground">定期修改密码可以保护账号安全</p>
                                            </div>
                                        </div>
                                        <RiArrowRightSLine className="w-5 h-5 text-muted-foreground" />
                                    </Button>

                                    <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto bg-muted/50 hover:bg-muted rounded-xl" onClick={() => setSecurityAction('email')}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                                <RiMailLine className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium">修改邮箱</p>
                                                <p className="text-xs text-muted-foreground">更换绑定的邮箱地址</p>
                                            </div>
                                        </div>
                                        <RiArrowRightSLine className="w-5 h-5 text-muted-foreground" />
                                    </Button>

                                    {user?.qq_identifier ? (
                                        <div className="p-4 bg-muted/50 rounded-xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-[#e6f7ff] flex items-center justify-center">
                                                    <RiQqFill className="w-5 h-5 text-[#12B7F5]" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-sm font-medium">已绑定 QQ</p>
                                                    <p className="text-xs text-muted-foreground">可通过QQ快捷登录</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-destructive hover:bg-destructive/10"
                                                onClick={handleQqUnbind}
                                                disabled={qqUnbinding}
                                            >
                                                {qqUnbinding ? '解绑中...' : '解除绑定'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <a
                                            href="/api/auth/qq/bind"
                                            className="w-full flex items-center justify-between p-4 h-auto bg-muted/50 hover:bg-muted rounded-xl no-underline cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#e6f7ff] flex items-center justify-center">
                                                    <RiQqFill className="w-5 h-5 text-[#12B7F5]" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-foreground">绑定 QQ 账号</p>
                                                    <p className="text-xs text-muted-foreground">绑定后可通过QQ快捷登录</p>
                                                </div>
                                            </div>
                                            <RiLinksLine className="w-5 h-5 text-muted-foreground" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
