#!/usr/bin/env tsx
/**
 * Calendly webhook subscription management.
 *
 * Calendly has no web UI for managing webhook subscriptions — they must be
 * created via the REST API. This script wraps the relevant endpoints.
 *
 * Env:
 *   CALENDLY_PERSONAL_ACCESS_TOKEN  (required) Bearer token from Calendly
 *   CALENDLY_WEBHOOK_SIGNING_KEY    (required for `create`) same key used by
 *                                    the receiver at /api/webhooks/calendly
 *
 * Usage:
 *   pnpm calendly:webhooks whoami
 *   pnpm calendly:webhooks list
 *   pnpm calendly:webhooks create [--url <callback>] [--scope user|organization]
 *   pnpm calendly:webhooks delete <uuid>
 */

const API = 'https://api.calendly.com';
const DEFAULT_CALLBACK = 'https://gymtext.co/api/webhooks/calendly';
const EVENTS = ['invitee.created', 'invitee.canceled'] as const;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

async function call<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = requireEnv('CALENDLY_PERSONAL_ACCESS_TOKEN');
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : ({} as T);
  if (!res.ok) {
    console.error(`Calendly API ${method} ${path} failed: ${res.status}`);
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }
  return json as T;
}

interface Me {
  resource: { uri: string; current_organization: string; name: string; email: string };
}

async function getMe(): Promise<Me['resource']> {
  const me = await call<Me>('GET', '/users/me');
  return me.resource;
}

function parseFlag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
}

async function cmdWhoami() {
  const me = await getMe();
  console.log(JSON.stringify(me, null, 2));
}

async function cmdList(argv: string[]) {
  const scope = (parseFlag(argv, 'scope') ?? 'organization') as 'organization' | 'user';
  const me = await getMe();
  const params = new URLSearchParams({
    organization: me.current_organization,
    scope,
  });
  if (scope === 'user') params.set('user', me.uri);
  const result = await call<{ collection: unknown[] }>(
    'GET',
    `/webhook_subscriptions?${params.toString()}`,
  );
  console.log(JSON.stringify(result, null, 2));
}

async function cmdCreate(argv: string[]) {
  const url = parseFlag(argv, 'url') ?? DEFAULT_CALLBACK;
  const scope = (parseFlag(argv, 'scope') ?? 'organization') as 'organization' | 'user';
  const signingKey = requireEnv('CALENDLY_WEBHOOK_SIGNING_KEY');
  const me = await getMe();

  const body: Record<string, unknown> = {
    url,
    events: EVENTS,
    organization: me.current_organization,
    scope,
    signing_key: signingKey,
  };
  if (scope === 'user') body.user = me.uri;

  console.log(`Creating Calendly webhook subscription:`);
  console.log(`  url:   ${url}`);
  console.log(`  scope: ${scope}`);
  console.log(`  events: ${EVENTS.join(', ')}`);

  const result = await call('POST', '/webhook_subscriptions', body);
  console.log(JSON.stringify(result, null, 2));
}

async function cmdDelete(argv: string[]) {
  const uuid = argv[0];
  if (!uuid) {
    console.error('Usage: calendly:webhooks delete <uuid>');
    process.exit(1);
  }
  await call('DELETE', `/webhook_subscriptions/${uuid}`);
  console.log(`Deleted webhook subscription ${uuid}`);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  switch (cmd) {
    case 'whoami':
      await cmdWhoami();
      break;
    case 'list':
      await cmdList(rest);
      break;
    case 'create':
      await cmdCreate(rest);
      break;
    case 'delete':
      await cmdDelete(rest);
      break;
    default:
      console.error('Usage: calendly:webhooks <whoami|list|create|delete>');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
