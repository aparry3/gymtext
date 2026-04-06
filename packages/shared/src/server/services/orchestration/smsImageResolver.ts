import { getUrlsConfig } from '@/shared/config';

export interface SmsImageContext {
  customDayImageUrl: string | null;
  programSmsImageUrl: string | null;
  ownerAvatarUrl: string | null;
}

export function resolveSmsImageUrl(ctx: SmsImageContext): string[] | undefined {
  if (ctx.customDayImageUrl) {
    return [ctx.customDayImageUrl];
  }

  if (ctx.programSmsImageUrl) {
    return [ctx.programSmsImageUrl];
  }

  if (ctx.ownerAvatarUrl) {
    return [ctx.ownerAvatarUrl];
  }

  const { publicBaseUrl, baseUrl } = getUrlsConfig();
  const resolvedBaseUrl = publicBaseUrl || baseUrl;
  if (!resolvedBaseUrl) {
    console.warn('BASE_URL not configured - sending message without logo image');
    return undefined;
  }
  return [`${resolvedBaseUrl}/OpenGraphGymtext.png`];
}
