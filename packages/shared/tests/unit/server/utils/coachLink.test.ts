import { describe, it, expect } from 'vitest';
import { buildCoachLink } from '@/server/utils/coachLink';

const user = { id: 'user-123', name: 'Sarah Chen', email: 'sarah@example.com' };

describe('buildCoachLink', () => {
  it('returns null when scheduling disabled', () => {
    expect(
      buildCoachLink(user, { schedulingEnabled: false, schedulingUrl: 'https://calendly.com/x/y' }),
    ).toBeNull();
  });

  it('returns null when url missing', () => {
    expect(buildCoachLink(user, { schedulingEnabled: true, schedulingUrl: null })).toBeNull();
  });

  it('returns null on invalid url', () => {
    expect(buildCoachLink(user, { schedulingEnabled: true, schedulingUrl: 'not a url' })).toBeNull();
  });

  it('appends prefill + utm params', () => {
    const link = buildCoachLink(user, {
      schedulingEnabled: true,
      schedulingUrl: 'https://calendly.com/gymtext/coach-jane/30min',
    });
    expect(link).not.toBeNull();
    const u = new URL(link!);
    expect(u.searchParams.get('name')).toBe('Sarah Chen');
    expect(u.searchParams.get('email')).toBe('sarah@example.com');
    expect(u.searchParams.get('utm_source')).toBe('gymtext');
    expect(u.searchParams.get('utm_medium')).toBe('sms');
    expect(u.searchParams.get('utm_campaign')).toBe('coach_link');
    expect(u.searchParams.get('utm_content')).toBe('user-123');
  });

  it('preserves existing query params on the base url', () => {
    const link = buildCoachLink(user, {
      schedulingEnabled: true,
      schedulingUrl: 'https://calendly.com/gymtext/coach?hide_gdpr_banner=1',
    });
    const u = new URL(link!);
    expect(u.searchParams.get('hide_gdpr_banner')).toBe('1');
    expect(u.searchParams.get('utm_content')).toBe('user-123');
  });

  it('omits email when null', () => {
    const link = buildCoachLink(
      { ...user, email: null },
      { schedulingEnabled: true, schedulingUrl: 'https://calendly.com/x/y' },
    );
    const u = new URL(link!);
    expect(u.searchParams.has('email')).toBe(false);
    expect(u.searchParams.get('name')).toBe('Sarah Chen');
  });
});
