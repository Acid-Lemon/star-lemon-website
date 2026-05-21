'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { RiMailLine, RiBilibiliLine, RiGithubFill } from '@remixicon/react';

interface ContactLinksProps {
  email: string;
  bilibili: string;
  github: string;
}

export function ContactLinks({ email, bilibili, github }: ContactLinksProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success('邮箱已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={copyEmail}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
        title="点击复制邮箱"
      >
        <RiMailLine className="w-3.5 h-3.5" />
        {copied ? '已复制' : '邮箱'}
      </button>

      <a
        href={bilibili}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/40 hover:bg-pink-200 dark:hover:bg-pink-900/60 rounded-full text-xs text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 transition-colors"
      >
        <RiBilibiliLine className="w-3.5 h-3.5" />
        Bilibili
      </a>

      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 rounded-full text-xs text-white transition-colors"
      >
        <RiGithubFill className="w-3.5 h-3.5" />
        GitHub
      </a>
    </div>
  );
}
