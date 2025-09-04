import { NextRequest, NextResponse } from 'next/server';
import { OnboardingChatService } from '@/server/services/onboardingChatService';
import type { User, FitnessProfile } from '@/server/models/userModel';

// Simplified onboarding chat endpoint
// - Accepts { message, currentUser?, currentProfile?, saveWhenReady? }
// - Uses pass-through approach with partial objects
// - Streams events (token, user_update, profile_update, ready_to_save, milestone)
// - No temp sessions, frontend manages state

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const { message, currentUser, currentProfile, saveWhenReady, conversationHistory } = await req.json().catch(() => ({})) as Partial<{
      message: string;
      currentUser: Partial<User>;
      currentProfile: Partial<FitnessProfile>;
      saveWhenReady: boolean;
      conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    }>;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
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
          currentUser: currentUser || {},
          currentProfile: currentProfile || {},
          saveWhenReady: saveWhenReady || false,
          conversationHistory: conversationHistory || [],
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

    // No more session cookies needed with pass-through approach

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
