'use client';

import { useState, useCallback, useEffect } from 'react';
import { RiCloseLine, RiArrowLeftSLine, RiArrowRightSLine, RiDownloadLine } from '@remixicon/react';

function handleDownload(src: string) {
    const a = document.createElement('a');
    a.href = src;
    a.download = '';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

interface ImageLightboxProps {
    src: string;
    onClose: () => void;
}

function SingleLightbox({ src, onClose }: ImageLightboxProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(src); }}
                    className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    title="下载图片"
                >
                    <RiDownloadLine className="w-5 h-5" />
                </button>
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                    <RiCloseLine className="w-5 h-5" />
                </button>
            </div>
            <img
                src={src}
                alt="预览"
                className="relative z-10 max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

interface GalleryLightboxProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

function GalleryLightbox({ images, initialIndex, onClose }: GalleryLightboxProps) {
    const [index, setIndex] = useState(initialIndex);

    const goPrev = useCallback(() => {
        setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    }, [images.length]);

    const goNext = useCallback(() => {
        setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    }, [images.length]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose, goPrev, goNext]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(images[index]); }}
                    className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    title="下载图片"
                >
                    <RiDownloadLine className="w-5 h-5" />
                </button>
                <button
                    onClick={onClose}
                    className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                    <RiCloseLine className="w-5 h-5" />
                </button>
            </div>
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        <RiArrowLeftSLine className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        <RiArrowRightSLine className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 z-10 text-white/80 text-sm font-medium">
                        {index + 1} / {images.length}
                    </div>
                </>
            )}
            <img
                src={images[index]}
                alt={`预览 ${index + 1}`}
                className="relative z-10 max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

export { SingleLightbox, GalleryLightbox };
