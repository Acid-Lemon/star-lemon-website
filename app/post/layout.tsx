import React from 'react';
import Link from 'next/link';

export default function PostLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4">
            {children}
        </div>
    );
}