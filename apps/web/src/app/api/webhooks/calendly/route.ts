import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRepositories } from '@/lib/context';

/**
 * POST /api/webhooks/calendly
 *
 * Receives Calendly webhook events for the GymText-owned Calendly account.
 * Records bookings to coach_bookings, attributing each one to a GymText user
 * via the `utm_content` tracking param (set when we generate the link).
 *
 * Events handled:
 * - invitee.created  → insert booking row (status: 'active')
 * - invitee.canceled → mark booking row as canceled
 *
 * Signature: Calendly sends `Calendly-Webhook-Signature: t=<ts>,v1=<hmac>`
 * where the signature is HMAC-SHA256 of `<ts>.<rawBody>` keyed with our
 * signing key (CALENDLY_WEBHOOK_SIGNING_KEY).
 */

const SIGNATURE_HEADER = 'calendly-webhook-signature';
const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

interface CalendlyInviteePayload {
  event: string;
  payload: {
    uri?: string;
    event?: string;
    cancel_url?: string;
    reschedule_url?: string;
    email?: string;
    name?: string;
    status?: string;
    cancellation?: { reason?: string; canceled_by?: string; created_at?: string };
    scheduled_event?: {
      uri?: string;
      start_time?: string;
      end_time?: string;
      event_type?: string;
    };
    tracking?: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
    };
  };
}

function verifySignature(rawBody: string, header: string | null, signingKey: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const [k, v] = p.trim().split('=');
      return [k, v];
    }),
  );
  const ts = parts.t;
  const sig = parts.v1;
  if (!ts || !sig) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_SIGNATURE_AGE_SECONDS) return false;

  const expected = crypto
    .createHmac('sha256', signingKey)
    .update(`${ts}.${rawBody}`)
    .digest('hex');

  // timingSafeEqual requires equal-length buffers
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(sig, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

    if (!signingKey) {
      console.error('[Calendly Webhook] CALENDLY_WEBHOOK_SIGNING_KEY not set');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const sigHeader = request.headers.get(SIGNATURE_HEADER);
    if (!verifySignature(rawBody, sigHeader, signingKey)) {
      console.error('[Calendly Webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let event: CalendlyInviteePayload;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log(`[Calendly Webhook] Received event: ${event.event}`);

    const repos = getRepositories();
    const payload = event.payload ?? {};

    switch (event.event) {
      case 'invitee.created': {
        const inviteeUri = payload.uri;
        const scheduledEvent = payload.scheduled_event;
        if (!inviteeUri || !scheduledEvent?.uri || !scheduledEvent.start_time) {
          console.error('[Calendly Webhook] invitee.created missing required fields');
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Resolve client via utm_content (preferred) or email fallback
        let clientId: string | null = null;
        const utmContent = payload.tracking?.utm_content;
        if (utmContent) {
          const u = await repos.user.findById(utmContent);
          if (u) clientId = u.id;
        }
        if (!clientId && payload.email) {
          const u = await repos.user.findByEmail(payload.email);
          if (u) clientId = u.id;
        }

        if (!clientId) {
          console.warn(
            `[Calendly Webhook] Could not attribute invitee ${inviteeUri} to a user (utm_content=${utmContent}, email=${payload.email})`,
          );
        }

        // Best-effort program lookup via active enrollment
        let programId: string | null = null;
        if (clientId) {
          const enrollment = await repos.programEnrollment.findActiveByClientId(clientId);
          if (enrollment) programId = enrollment.programId;
        }

        // Idempotency: skip if already recorded
        const existing = await repos.coachBooking.findByInviteeUri(inviteeUri);
        if (existing) {
          console.log(`[Calendly Webhook] invitee ${inviteeUri} already recorded, skipping`);
          break;
        }

        await repos.coachBooking.create({
          clientId,
          programId,
          calendlyEventUri: scheduledEvent.uri,
          calendlyInviteeUri: inviteeUri,
          eventTypeUri: scheduledEvent.event_type ?? null,
          scheduledAt: new Date(scheduledEvent.start_time),
          status: 'active',
          rawPayload: JSON.parse(JSON.stringify(payload)),
        });
        console.log(`[Calendly Webhook] Recorded booking for invitee ${inviteeUri} (client=${clientId ?? 'unattributed'})`);
        break;
      }

      case 'invitee.canceled': {
        const inviteeUri = payload.uri;
        if (!inviteeUri) {
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        const canceledAt = payload.cancellation?.created_at
          ? new Date(payload.cancellation.created_at)
          : new Date();
        const reason = payload.cancellation?.reason ?? null;
        const updated = await repos.coachBooking.markCanceled(inviteeUri, canceledAt, reason);
        if (!updated) {
          console.warn(`[Calendly Webhook] invitee.canceled for unknown booking ${inviteeUri}`);
        } else {
          console.log(`[Calendly Webhook] Canceled booking ${inviteeUri}`);
        }
        break;
      }

      default:
        console.log(`[Calendly Webhook] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Calendly Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
