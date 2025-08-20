"use client";
import { useCallback, useState } from 'react';
import Link from 'next/link';

type EventType = 'token' | 'profile_patch' | 'milestone' | 'error';

// type PendingRequired = Array<'name' | 'email' | 'phone' | 'primaryGoal'>;

export default function ChatContainer() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [essentialsComplete, setEssentialsComplete] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const send = useCallback(async () => {
    if (!input.trim()) return;
    // Expand to fullscreen when sending the first message
    if (!isExpanded) setIsExpanded(true);
    const response = await fetch('/api/chat/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input.trim() }),
    });
    if (!response.ok || !response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    setConnected(true);
    setMessages((m) => [...m, `You: ${input.trim()}`]);
    setInput('');

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
            setMessages((m) => [...m, String(data)]);
          } else if (event === 'profile_patch') {
            const fields = (data?.updates as string[] | undefined) ?? [];
            if (fields.length > 0) setUpdatedFields((prev) => Array.from(new Set([...prev, ...fields])));
          } else if (event === 'milestone') {
            if (data === 'essentials_complete') setEssentialsComplete(true);
          }
        } catch {
          // ignore json errors
        }
      }
    }
    setConnected(false);
  }, [input, isExpanded]);

  return (
    <div className={isExpanded ? 'w-full h-[90vh] bg-white p-4 md:p-6 rounded-lg shadow' : 'space-y-4 md:grid md:grid-cols-3 md:gap-4'}>
      <div className={isExpanded ? 'max-w-5xl mx-auto grid md:grid-cols-3 md:gap-4' : 'md:col-span-2 space-y-3'}>
        {!isExpanded && (
          <div className="md:col-span-2 space-y-3">
            <div className="text-sm text-gray-600">Start typing to expand the chat.</div>
          </div>
        )}
        {isExpanded && (
          <div className="md:col-span-3 flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Onboarding Chat</div>
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setIsExpanded(false)}
            >
              Minimize
            </button>
          </div>
        )}
        <div className={isExpanded ? 'md:col-span-2 space-y-3' : 'md:col-span-2 space-y-3'}>
          <div className="rounded border p-3 h-64 overflow-auto bg-white">
          {messages.map((m, i) => (
            <div key={i} className="text-sm text-gray-800">
              {m}
            </div>
          ))}
          {connected && <div className="text-xs text-gray-500">Assistant is typing…</div>}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onFocus={() => setIsExpanded(true)}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What are your fitness goals?"
              className="flex-1 rounded border px-3 py-2"
            />
            <button onClick={send} className="rounded bg-black px-3 py-2 text-white" disabled={!input.trim()}>
              Send
            </button>
          </div>
        </div>
        <div className={isExpanded ? 'md:col-span-1 space-y-3 mt-4 md:mt-0' : 'md:col-span-1 space-y-3'}>
          <div className="rounded border p-3 bg-white">
            <div className="text-sm font-medium mb-2">Profile Summary (live)</div>
            <div className="text-xs text-gray-600 mb-2">Recently updated: {updatedFields.length > 0 ? updatedFields.join(', ') : '—'}</div>
            <div className="text-xs">Essentials status: {essentialsComplete ? 'Complete' : 'Collecting'}</div>
          </div>
          {essentialsComplete && (
            <Link href="/" className="block text-center rounded bg-emerald-600 px-3 py-2 text-white text-sm">
              Continue signup
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
