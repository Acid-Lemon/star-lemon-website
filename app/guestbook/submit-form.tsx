'use client';

import { useFormStatus } from 'react-dom';
import { useTransition, useState, useRef } from 'react';
import { toast } from 'sonner';
import { RiSendPlaneLine } from '@remixicon/react';
import { EmojiPicker } from '../components/emoji-picker';

const MAX_IMAGES = 9;

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 transition-all duration-300 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-1.5"
        >
            {pending ? (
                <>
                    <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    发送中...
                </>
            ) : (
                <>
                    <RiSendPlaneLine className="w-4 h-4" />
                    发送留言
                </>
            )}
        </button>
    );
}

export function SubmitMessageForm({ onSuccess }: { onSuccess?: (message: any) => void }) {
    const [, startTransition] = useTransition();
    const [content, setContent] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remaining = MAX_IMAGES - imageUrls.length;
        if (remaining <= 0) {
            toast.error(`最多上传${MAX_IMAGES}张图片`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remaining);
        setUploading(true);

        const uploaded: string[] = [];
        for (const file of filesToUpload) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    uploaded.push(data.url);
                } else {
                    toast.error(`${file.name} 上传失败`);
                }
            } catch {
                toast.error(`${file.name} 上传失败`);
            }
        }

        if (uploaded.length > 0) {
            setImageUrls(prev => [...prev, ...uploaded]);
            toast.success(`已上传${uploaded.length}张图片`);
        }
        setUploading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleEmojiSelect = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmoji(false);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!content.trim() && imageUrls.length === 0) return;

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('content', content);
                if (imageUrls.length > 0) {
                    formData.append('image_url', imageUrls.join(','));
                }

                const res = await fetch('/api/guestbook', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    toast.success('留言成功');
                    setContent('');
                    setImageUrls([]);
                    formRef.current?.reset();
                    if (onSuccess && data.message) {
                        onSuccess(data.message);
                    }
                } else {
                    toast.error(data.message || '发送失败');
                }
            } catch {
                toast.error('发送失败，请重试');
            }
        });
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
            <div className="space-y-3">
                <div className="relative">
                    <textarea
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        placeholder="有什么想对我们说的..."
                        required
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all shadow-sm"
                    ></textarea>
                </div>

                {imageUrls.length > 0 && (
                    <div>
                        <div className="grid grid-cols-3 gap-2">
                            {imageUrls.map((url, i) => (
                                <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden">
                                    <img
                                        src={url}
                                        alt={`图片${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{imageUrls.length}/{MAX_IMAGES}</p>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-lg"
                            >
                                😊
                            </button>
                            {showEmoji && (
                                <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setShowEmoji(false)}
                                />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={imageUrls.length >= MAX_IMAGES}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors text-lg relative"
                        >
                            📷
                            {imageUrls.length > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium px-0.5">
                                    {imageUrls.length}
                                </span>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple={true}
                            onChange={handleImageUpload}
                            className="hidden"
                            key={imageUrls.length}
                        />
                        {uploading && <span className="text-xs text-gray-400 dark:text-gray-500">上传中...</span>}
                    </div>
                    <SubmitButton />
                </div>
            </div>
        </form>
    );
}
