"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

type EventType = 'token' | 'profile_patch' | 'milestone' | 'error';
type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [essentialsComplete, setEssentialsComplete] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  const placeholderSuggestions = useMemo(
    () => [
      'I want to get stronger for climbing',
      'Help me lose 10 pounds in 3 months',
      'I have dumbbells and a bench at home',
      'I can work out 3 days a week',
    ],
    []
  );

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isExpanded) setIsExpanded(true);

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: trimmed };
    const assistantMsg: ChatMessage = { id: uuidv4(), role: 'assistant', content: '' };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');

    const response = await fetch('/api/chat/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    });
    if (!response.ok || !response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    setConnected(true);
    setIsStreaming(true);

    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = raw.split('\n');
        let event: EventType = 'token';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.slice(6).trim() as EventType;
          if (line.startsWith('data:')) dataStr += (dataStr ? '\n' : '') + line.slice(5).trim();
        }
        try {
          const data = dataStr ? JSON.parse(dataStr) : '';
          if (event === 'token') {
            setMessages((prev) => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
                next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + String(data) };
              }
              return next;
            });
          } else if (event === 'profile_patch') {
            const fields = (data?.updates as string[] | undefined) ?? [];
            if (fields.length > 0) setUpdatedFields((prev) => Array.from(new Set([...prev, ...fields])));
          } else if (event === 'milestone') {
            if (data === 'essentials_complete') setEssentialsComplete(true);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    setConnected(false);
    setIsStreaming(false);
  }, [input, isExpanded]);

  return (
    <div
      className={
        isExpanded
          ? 'w-full h-[92vh] rounded-2xl shadow ring-1 ring-black/5 bg-gradient-to-b from-slate-50 to-white'
          : 'w-full'
      }
    >
      {/* Hero state */}
      {!isExpanded && !hasMessages && (
        <div className="relative min-h-[100vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-white" />
          <div className="relative mx-auto flex min-h-[100vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-3 py-1 text-xs text-emerald-700 shadow-sm backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              AI Fitness Onboarding
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              Tell us your goals. We’ll build your plan.
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-gray-600">
              Start a quick conversation to personalize your training. Once we’ve got the essentials, we’ll
              move you to SMS coaching.
            </p>
            <div className="mt-8 w-full max-w-2xl">
              <div className="flex items-stretch gap-2 rounded-2xl border border-gray-200 bg-white/90 p-2 shadow-sm backdrop-blur transition">
                <input
                  aria-label="Describe your fitness goals"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="What are your fitness goals?"
                  className="flex-1 rounded-xl border-0 px-4 py-4 text-base placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || isStreaming}
                  className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  Start
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {placeholderSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="text-xs rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Personalized plans</div>
              <div className="hidden md:flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> SMS coaching</div>
              <div className="hidden md:flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Quick onboarding</div>
            </div>
          </div>
        </div>
      )}

      {/* Chat state */}
      {(isExpanded || hasMessages) && (
        <div className="h-full max-w-6xl mx-auto grid grid-rows-[auto_1fr_auto] md:grid-cols-3 md:grid-rows-1 md:gap-6 p-4 md:p-6">
          <header className="row-start-1 md:col-span-3 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-semibold">GT</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Onboarding Chat</div>
                <div className="text-xs text-gray-500">We’ll tailor your plan as we chat</div>
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-900"
              onClick={() => setIsExpanded(false)}
            >
              Minimize
            </button>
          </header>

          <section className="row-start-2 md:col-span-2 overflow-y-auto pr-1">
            <div className="flex flex-col gap-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === 'assistant' ? 'flex items-start gap-3' : 'flex items-start gap-3 justify-end'}
                >
                  {m.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-semibold">GT</div>
                  )}
                  <div
                    className={
                      m.role === 'assistant'
                        ? 'max-w-[85%] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm'
                        : 'max-w-[85%] rounded-2xl bg-emerald-600 px-4 py-3 text-sm text-white shadow-sm'
                    }
                  >
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-semibold">You</div>
                  )}
                </div>
              ))}

              {connected && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-[ping_1.5s_infinite] rounded-full bg-emerald-500" />
                    <span className="h-2 w-2 animate-[ping_1.8s_infinite] rounded-full bg-emerald-500" />
                    <span className="h-2 w-2 animate-[ping_2.1s_infinite] rounded-full bg-emerald-500" />
                  </div>
                  Assistant is typing…
                </div>
              )}

              <div ref={scrollAnchorRef} />
            </div>
          </section>

          <aside className="row-start-2 md:row-start-1 md:col-start-3 md:row-span-2 hidden md:flex md:flex-col gap-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-medium">Profile Summary (live)</div>
              <div className="mb-2 text-xs text-gray-600">
                Recently updated: {updatedFields.length > 0 ? updatedFields.join(', ') : '—'}
              </div>
              <div className="text-xs">Essentials status: {essentialsComplete ? 'Complete' : 'Collecting'}</div>
            </div>
            {essentialsComplete && (
              <Link href="/" className="block rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white shadow-sm">
                Continue signup
              </Link>
            )}
          </aside>

          <footer className="row-start-3 md:col-span-2 sticky bottom-0 bg-gradient-to-t from-white via-white pt-2">
            <div className="flex items-end gap-2 rounded-2xl border bg-white p-2 shadow-sm">
              <input
                value={input}
                onFocus={() => setIsExpanded(true)}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="What are your fitness goals?"
                className="flex-1 rounded-xl border-0 px-3 py-3 text-sm focus:outline-none"
              />
              <button
                onClick={send}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white text-sm disabled:opacity-50"
                disabled={!input.trim() || isStreaming}
              >
                Send
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
