"use client";
import { useCallback, useState } from 'react';

type EventType = 'token' | 'profile_patch' | 'milestone' | 'error';

export default function ChatContainer() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);

  const send = useCallback(async () => {
    if (!input.trim()) return;
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
          }
        } catch {
          // ignore json errors
        }
      }
    }
    setConnected(false);
  }, [input]);

  return (
    <div className="space-y-4">
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
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are your fitness goals?"
          className="flex-1 rounded border px-3 py-2"
        />
        <button onClick={send} className="rounded bg-black px-3 py-2 text-white" disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
