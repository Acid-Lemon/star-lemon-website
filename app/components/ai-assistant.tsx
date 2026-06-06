'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RiSendPlaneLine, RiVolumeUpLine, RiDeleteBinLine, RiCloseLine, RiChatSmileLine } from '@remixicon/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAssistantStore } from './assistant-store';
import { useUser } from './user-context';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const AUTO_READ_KEY = 'ai-assistant-auto-read';

export function AiAssistant() {
  const store = useAssistantStore();
  const user = useUser();
  const [input, setInput] = useState('');
  const [configLoaded, setConfigLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState<string | null>(null);
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [autoRead, setAutoRead] = useState(() => {
    try {
      return localStorage.getItem(AUTO_READ_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/api/assistant/config')
      .then(res => res.json())
      .then(data => {
        setEnabled(data.enabled === true);
        setTtsAvailable(data.ttsAvailable === true);
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  useEffect(() => {
    if (store.isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [store.isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTO_READ_KEY, autoRead ? 'true' : 'false');
    } catch {}
  }, [autoRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [store.messages, store.streamingContent]);

  const playTts = useCallback(async (text: string, messageId: string) => {
    if (ttsPlaying === messageId || ttsLoading === messageId) return;
    setTtsLoading(messageId);

    try {
      const response = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        setTtsLoading(null);
        return;
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('audio') || contentType.includes('octet-stream')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        setTtsLoading(null);
        setTtsPlaying(messageId);
        audio.onended = () => {
          setTtsPlaying(null);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setTtsPlaying(null);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } else {
        const data = await response.json();
        if (data.audioUrl || data.url) {
          setTtsLoading(null);
          setTtsPlaying(messageId);
          const audio = new Audio(data.audioUrl || data.url);
          audio.onended = () => setTtsPlaying(null);
          audio.onerror = () => setTtsPlaying(null);
          await audio.play();
        }
        setTtsLoading(null);
      }
    } catch {
      setTtsLoading(null);
      setTtsPlaying(null);
    }
  }, [ttsLoading, ttsPlaying]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || store.isStreaming) return;

    setInput('');

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: text,
      timestamp: Date.now(),
    };

    store.addMessage(userMsg);

    const fullMessages = [...store.messages, userMsg];

    store.setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        store.setStreaming(false);
        store.addMessage({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `错误: ${errorText}`,
          timestamp: Date.now(),
        });
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        store.setStreaming(false);
        return;
      }

      let buffer = '';
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              store.appendStreamingContent(parsed.content);
            }
          } catch {
            // skip
          }
        }
      }

      store.finalizeStreaming();
      if (autoRead && ttsAvailable && assistantContent.trim()) {
        void playTts(assistantContent, `auto-${Date.now()}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        store.finalizeStreaming();
      } else {
        store.setStreaming(false);
        store.addMessage({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '请求失败，请稍后重试',
          timestamp: Date.now(),
        });
      }
    }
  }, [autoRead, input, playTts, store, ttsAvailable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!configLoaded || !enabled) return null;

  return (
    <>
      {/* Floating Bubble */}
      {!store.isOpen && (
        <button
          onClick={() => store.setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="打开AI助手"
        >
          <RiChatSmileLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-white" />
        </button>
      )}

      {/* Chat Dialog */}
      <Dialog open={store.isOpen} onOpenChange={(open) => store.setOpen(open)}>
        <DialogContent
          showCloseButton={false}
          className="sm:w-[70vw] sm:max-w-[70vw] h-[80vh] flex flex-col p-0 gap-0 rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <img src="/avatar/zoe.png" alt="Zoe" className="w-8 h-8 rounded-full object-cover" />
              <DialogTitle className="text-sm">Zoe</DialogTitle>
              <DialogDescription className="text-xs">有什么问题都可以问我</DialogDescription>
            </div>
            <div className="flex items-center gap-1">
              {ttsAvailable && (
                <label className="flex items-center gap-2 px-2 text-xs text-gray-500 dark:text-gray-400">
                  <Switch size="sm" checked={autoRead} onCheckedChange={setAutoRead} />
                  自动朗读
                </label>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={store.clearMessages}
                title="清空对话"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => store.setOpen(false)}
              >
                <RiCloseLine className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {store.messages.length === 0 && !store.isStreaming && (
              <div className="text-center py-8">
                <img src="/avatar/zoe.png" alt="Zoe" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">开始和 Zoe 对话吧</p>
              </div>
            )}

            {store.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <img src="/avatar/zoe.png" alt="Zoe" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none chat-markdown prose-code:text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.role === 'assistant' && ttsAvailable && (
                    <button
                      onClick={() => playTts(msg.content, msg.id)}
                      className={`mt-1 flex items-center gap-1 text-xs transition-colors ${
                        ttsLoading === msg.id
                          ? 'text-orange-400 dark:text-orange-300 cursor-wait'
                          : ttsPlaying === msg.id
                          ? 'text-orange-500 dark:text-orange-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-orange-400 dark:hover:text-orange-500'
                      }`}
                    >
                      <RiVolumeUpLine className="w-3.5 h-3.5" />
                      {ttsLoading === msg.id ? '生成中...' : ttsPlaying === msg.id ? '播放中' : '朗读'}
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  user?.avatar
                    ? <img src={user.avatar} alt={user.nickname} className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                    : <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 shrink-0 mt-1 text-xs font-bold">
                        {user?.nickname?.charAt(0) || 'U'}
                      </div>
                )}
              </div>
            ))}

            {store.isStreaming && store.streamingContent && (
              <div className="flex gap-3 justify-start">
                <img src="/avatar/zoe.png" alt="Zoe" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none chat-markdown prose-code:text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {store.streamingContent}
                    </ReactMarkdown>
                  </div>
                  <span className="inline-block w-1.5 h-4 bg-orange-500 animate-pulse ml-1" />
                </div>
              </div>
            )}

            {store.isStreaming && !store.streamingContent && (
              <div className="flex gap-3 justify-start">
                <img src="/avatar/zoe.png" alt="Zoe" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-400">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t px-4 py-3 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                disabled={store.isStreaming}
                className="flex-1 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 transition-colors disabled:opacity-50"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || store.isStreaming}
                size="icon"
                className="rounded-full h-10 w-10 bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              >
                <RiSendPlaneLine className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
