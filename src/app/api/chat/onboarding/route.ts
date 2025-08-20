import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { OnboardingChatService } from '@/server/services/onboardingChatService';

// Phase 1: Minimal SSE streaming endpoint scaffold
// - Accepts { message, conversationId?, tempSessionId? }
// - Ensures a temp session cookie exists for unauth flows
// - Streams placeholder events (token, profile_patch, milestone)
// - Phase 2 will delegate to OnboardingChatService for real orchestration

export const dynamic = 'force-dynamic';

// (reserved) helper for Phase 2 orchestration

export async function POST(req: NextRequest) {
  try {
    const { message, tempSessionId } = await req.json().catch(() => ({ })) as Partial<{
      message: string;
      tempSessionId: string;
    }>;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Resolve auth (Phase 1: unauth only; Phase 2+: attach real user if present)
    // Ensure temp session cookie exists
    const cookieName = 'gt_temp_session';
    let sessionId = tempSessionId || req.cookies.get(cookieName)?.value;
    if (!sessionId) {
      sessionId = randomUUID();
      // Will set cookie on the response below (7-day temp cookie)
    }

    // Create a TransformStream for SSE
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Phase 2: stream real events from service
    const service = new OnboardingChatService();
    queueMicrotask(async () => {
      try {
        await writer.write(`retry: 1500\n\n`);
        for await (const evt of service.streamMessage({
          message,
          tempSessionId: sessionId,
        })) {
          await writer.write(`event: ${evt.type}\n` + `data: ${JSON.stringify(evt.data)}\n\n`);
        }
      } catch {
        try {
          await writer.write(`event: error\n` + `data: ${JSON.stringify('stream_error')}\n\n`);
        } catch {}
      } finally {
        try { await writer.close(); } catch {}
      }
    });

    const response = new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering on some proxies
      },
    });

    // If we created a new sessionId, set it as cookie
    if (sessionId && !req.cookies.get(cookieName)?.value) {
      response.cookies.set({
        name: cookieName,
        value: sessionId,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
