export interface SseEvent<T = unknown> {
  event: string;
  data: T;
}

/**
 * Incrementally parse text/event-stream chunks into SseEvent objects.
 * Maintains an internal buffer across chunk boundaries.
 */
export class SseParser {
  private buffer = '';

  pushChunk(chunk: string): SseEvent[] {
    this.buffer += chunk;
    const events: SseEvent[] = [];

    // Split on double newlines which delimit SSE messages
    let idx: number;
    while ((idx = this.buffer.indexOf('\n\n')) !== -1) {
      const raw = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 2);

      const lines = raw.split(/\r?\n/);
      let event = 'message';
      const dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }

      const dataStr = dataLines.join('\n');
      let data: unknown = dataStr;
      try {
        data = dataStr ? JSON.parse(dataStr) : '';
      } catch {
        // keep as raw string
      }
      events.push({ event, data });
    }

    return events;
  }
}
