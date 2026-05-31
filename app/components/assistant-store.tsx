'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AssistantState {
  messages: Message[];
  isOpen: boolean;
  isStreaming: boolean;
  streamingContent: string;
}

interface AssistantActions {
  setOpen: (open: boolean) => void;
  addMessage: (msg: Message) => void;
  updateLastAssistant: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  finalizeStreaming: () => void;
  clearMessages: () => void;
}

type AssistantStore = AssistantState & AssistantActions;

const STORAGE_KEY = 'ai-assistant-messages';
const MAX_MESSAGES = 100;

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_MESSAGES) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  } catch {}
}

const AssistantContext = createContext<AssistantStore | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContentState] = useState('');
  const streamingRef = useRef('');

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg].slice(-MAX_MESSAGES));
  }, []);

  const updateLastAssistant = useCallback((content: string) => {
    setMessages(prev => {
      const idx = prev.findLastIndex(m => m.role === 'assistant');
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], content };
      return updated;
    });
  }, []);

  const setStreaming = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
    if (!streaming) {
      streamingRef.current = '';
      setStreamingContentState('');
    }
  }, []);

  const setStreamingContent = useCallback((content: string) => {
    streamingRef.current = content;
    setStreamingContentState(content);
  }, []);

  const appendStreamingContent = useCallback((chunk: string) => {
    streamingRef.current += chunk;
    setStreamingContentState(streamingRef.current);
  }, []);

  const finalizeStreaming = useCallback(() => {
    const content = streamingRef.current;
    if (content) {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
      });
    }
    streamingRef.current = '';
    setIsStreaming(false);
    setStreamingContentState('');
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const store: AssistantStore = {
    messages,
    isOpen,
    isStreaming,
    streamingContent,
    setOpen: setIsOpen,
    addMessage,
    updateLastAssistant,
    setStreaming,
    setStreamingContent,
    appendStreamingContent,
    finalizeStreaming,
    clearMessages,
  };

  return <AssistantContext.Provider value={store}>{children}</AssistantContext.Provider>;
}

export function useAssistantStore(): AssistantStore {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistantStore must be used within AssistantProvider');
  return ctx;
}