'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(event.target?.result as string);
        setShowCropper(true);
        // 计算裁剪区域（居中裁剪 16:9）
        const targetRatio = 16 / 9;
        const imgRatio = img.width / img.height;
        
        let cropWidth, cropHeight, cropX, cropY;
        
        if (imgRatio > targetRatio) {
          // 图片更宽，以高度为基准
          cropHeight = img.height;
          cropWidth = img.height * targetRatio;
          cropX = (img.width - cropWidth) / 2;
          cropY = 0;
        } else {
          // 图片更高，以宽度为基准
          cropWidth = img.width;
          cropHeight = img.width / targetRatio;
          cropX = 0;
          cropY = (img.height - cropHeight) / 2;
        }
        
        setCropData({ x: cropX, y: cropY, width: cropWidth, height: cropHeight });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCropAndUpload = useCallback(async () => {
    if (!originalImage || !canvasRef.current) return;

    setUploading(true);
    
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

      // 设置 canvas 尺寸为裁剪区域
      canvas.width = cropData.width;
      canvas.height = cropData.height;
      
      // 绘制裁剪后的图片
      ctx.drawImage(
        loadedImg,
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, cropData.width, cropData.height
      );
      
      // 转换为 Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/jpeg', 0.9);
      });

      // 上传
      const formData = new FormData();
      formData.append('file', blob, 'cover.jpg');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setCover(data.url);
        onChange?.(data.url);
        toast.success('封面上传成功');
        setShowCropper(false);
        setOriginalImage('');
      } else {
        toast.error('封面上传失败');
      }
    } catch (error) {
      toast.error('封面上传失败');
    } finally {
      setUploading(false);
    }
  }, [originalImage, cropData, onChange]);

  const handleRemove = () => {
    setCover('');
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="cover"
        value={cover}
      />
      
      {cover ? (
        <div className="relative group">
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={cover}
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
          className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <span className="text-sm text-muted-foreground">上传中...</span>
          ) : (
            <>
              <RiImageLine className="w-10 h-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">点击上传封面图片</span>
              <span className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、GIF、WebP，最大 5MB</span>
              <span className="text-xs text-orange-500 mt-1">将自动裁剪为 16:9 比例</span>
            </>
          )}
        </div>
      )}

      {/* 裁剪对话框 */}
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
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  ref={imageRef}
                  src={originalImage} 
                  alt="原图" 
                  className="w-full h-auto"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                {/* 裁剪区域指示器 */}
                <div 
                  className="absolute border-2 border-blue-500 bg-blue-500/20"
                  style={{
                    left: `${(cropData.x / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                    top: `${(cropData.y / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                    width: `${(cropData.width / (imageRef.current?.naturalWidth || 1)) * 100}%`,
                    height: `${(cropData.height / (imageRef.current?.naturalHeight || 1)) * 100}%`,
                  }}
                />
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                图片将自动裁剪为 16:9 比例（居中裁剪）
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
                  onClick={handleCropAndUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? '上传中...' : '确认裁剪并上传'}
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
