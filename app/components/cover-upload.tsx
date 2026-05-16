'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RiImageLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CoverUploadProps {
  defaultValue?: string;
  onChange?: (url: string) => void;
}

export function CoverUpload({ defaultValue, onChange }: CoverUploadProps) {
  const [cover, setCover] = useState(defaultValue || '');
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [cropData, setCropData] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startCropX: 0, startCropY: 0 });

  const fitScale = cropData.w > 0 ? 640 / cropData.w : 1;
  const displayScale = fitScale * cropScale;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const form = container.closest('form');
    if (!form) return;

    const handleSubmit = async (e: Event) => {
      if (!pendingBlob || submittingRef.current) return;

      e.preventDefault();
      e.stopPropagation();
      submittingRef.current = true;
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', pendingBlob, 'cover.jpg');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setCover(data.url);
          onChange?.(data.url);

          const hiddenInput = container?.querySelector('input[name="cover"]') as HTMLInputElement;
          if (hiddenInput) hiddenInput.value = data.url;

          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
          setPendingBlob(null);
        } else {
          toast.error('封面上传失败');
          submittingRef.current = false;
        }
      } catch {
        toast.error('封面上传失败');
        submittingRef.current = false;
      } finally {
        setUploading(false);
      }
    };

    form.addEventListener('submit', handleSubmit);
    return () => {
      form.removeEventListener('submit', handleSubmit);
    };
  }, [pendingBlob, previewUrl, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(event.target?.result as string);
        setImgNatural({ w: img.width, h: img.height });
        const targetRatio = 16 / 9;
        const imgRatio = img.width / img.height;

        let cw: number, ch: number, cx: number, cy: number;

        if (imgRatio > targetRatio) {
          ch = img.height;
          cw = img.height * targetRatio;
          cx = (img.width - cw) / 2;
          cy = 0;
        } else {
          cw = img.width;
          ch = img.width / targetRatio;
          cx = 0;
          cy = (img.height - ch) / 2;
        }

        setCropData({ x: cx, y: cy, w: cw, h: ch });
        setCropScale(1);
        setShowCropper(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCropPointerDown = (e: React.PointerEvent) => {
    const imgEl = imageRef.current;
    if (!imgEl) return;
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startCropX: cropData.x,
      startCropY: cropData.y,
    };
    imgEl.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const d = dragRef.current;
    const dx = (e.clientX - d.startX) / displayScale;
    const dy = (e.clientY - d.startY) / displayScale;
    const imgEl = imageRef.current;
    if (!imgEl) return;
    const maxX = imgEl.naturalWidth - cropData.w;
    const maxY = imgEl.naturalHeight - cropData.h;
    setCropData(prev => ({
      ...prev,
      x: Math.max(0, Math.min(d.startCropX - dx, maxX)),
      y: Math.max(0, Math.min(d.startCropY - dy, maxY)),
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

  const handleCropConfirm = useCallback(async () => {
    if (!originalImage || !canvasRef.current) return;

    try {
      const img = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = originalImage;
      });

      const loadedImg = await img;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = cropData.w;
      canvas.height = cropData.h;

      ctx.drawImage(
        loadedImg,
        cropData.x, cropData.y, cropData.w, cropData.h,
        0, 0, cropData.w, cropData.h
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/jpeg', 0.9);
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      setPendingBlob(blob);
      setShowCropper(false);
      setOriginalImage('');
    } catch {
      toast.error('裁剪失败');
    }
  }, [originalImage, cropData, previewUrl]);

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCover('');
    setPreviewUrl('');
    setPendingBlob(null);
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || cover;

  return (
    <div ref={containerRef} className="space-y-3">
      <input
        type="hidden"
        name="cover"
        value={cover}
      />
      <input
        type="hidden"
        name="oldCover"
        value={defaultValue || ''}
      />

      {displayUrl ? (
        <div className="relative group max-w-md">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={displayUrl}
              alt="封面预览"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              更换
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              移除
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-md aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <span className="text-sm text-muted-foreground">上传中...</span>
          ) : (
            <>
              <RiImageLine className="w-10 h-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">点击上传封面图片</span>
              <span className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、GIF、WebP，最大 5MB</span>
              <span className="text-xs text-orange-500 mt-1">将裁剪为 16:9 比例</span>
            </>
          )}
        </div>
      )}

      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCropper(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">裁剪封面图片</h3>
              <button
                onClick={() => setShowCropper(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="relative mx-auto mb-4 overflow-hidden rounded-lg" style={{ width: 640, height: 360 }} onWheel={handleCropWheel}>
                <img
                  ref={imageRef}
                  src={originalImage}
                  alt="原图"
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
                  draggable={false}
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
              </div>

              <p className="text-sm text-gray-500 mb-4 text-center">
                拖拽移动 · 滚轮缩放 · 16:9 比例
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

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}