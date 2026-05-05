'use client';

import { useState, useEffect, useCallback } from 'react';

export function TypewriterText({
    texts,
    speed = 80,
    deleteSpeed = 40,
    pauseDuration = 2500,
    className = '',
}: {
    texts: string[];
    speed?: number;
    deleteSpeed?: number;
    pauseDuration?: number;
    className?: string;
}) {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const tick = useCallback(() => {
        const currentText = texts[textIndex];

        if (!isDeleting) {
            if (charIndex < currentText.length) {
                setDisplayText(currentText.slice(0, charIndex + 1));
                setCharIndex(prev => prev + 1);
            } else {
                setTimeout(() => setIsDeleting(true), pauseDuration);
                return;
            }
        } else {
            if (charIndex > 0) {
                setDisplayText(currentText.slice(0, charIndex - 1));
                setCharIndex(prev => prev - 1);
            } else {
                setIsDeleting(false);
                setTextIndex(prev => (prev + 1) % texts.length);
            }
        }
    }, [charIndex, isDeleting, textIndex, texts, pauseDuration]);

    useEffect(() => {
        const delay = isDeleting ? deleteSpeed : speed;
        const timer = setTimeout(tick, delay);
        return () => clearTimeout(timer);
    }, [tick, isDeleting, deleteSpeed, speed]);

    return (
        <span className={className}>
            {displayText}
            <span className="inline-block w-[3px] h-[1em] bg-orange-500 dark:bg-orange-400 ml-1 align-middle animate-pulse" />
        </span>
    );
}
