#!/usr/bin/env npx tsx
/**
 * WhatsApp Template Submission Script
 *
 * Submits all 6 template definitions to Meta's WhatsApp Business API.
 *
 * Usage:
 *   npx tsx packages/shared/src/server/whatsapp/scripts/submitTemplates.ts
 *
 * Required env vars:
 *   WHATSAPP_BUSINESS_ACCOUNT_ID - Your WABA ID
 *   WHATSAPP_ACCESS_TOKEN        - System User access token
 *   WHATSAPP_API_VERSION          - API version (default: v23.0)
 *
 * Optional:
 *   --dry-run   Print payloads without submitting
 *   --template  Submit a single template by name
 */

import { ALL_TEMPLATES, buildTemplateSubmissionPayload } from '../templates';

const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const templateFilter = args.find((a) => a.startsWith('--template='))?.split('=')[1];

async function submitTemplate(payload: Record<string, unknown>): Promise<void> {
  const url = `https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${JSON.stringify(data)}`);
  }

  console.log(`  ✅ Submitted! ID: ${(data as any).id}, Status: ${(data as any).status}`);
}

async function main() {
  if (!dryRun && (!WABA_ID || !ACCESS_TOKEN)) {
    console.error('❌ Missing WHATSAPP_BUSINESS_ACCOUNT_ID or WHATSAPP_ACCESS_TOKEN');
    console.error('   Set these env vars or use --dry-run to preview payloads.');
    process.exit(1);
  }

  const templates = templateFilter
    ? ALL_TEMPLATES.filter((t) => t.name === templateFilter)
    : ALL_TEMPLATES;

  if (templates.length === 0) {
    console.error(`❌ No template found matching: ${templateFilter}`);
    process.exit(1);
  }

  console.log(`\n📋 WhatsApp Template Submission`);
  console.log(`   Templates: ${templates.length}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   API: ${API_VERSION}`);
  if (!dryRun) console.log(`   WABA: ${WABA_ID}`);
  console.log('');

  for (const template of templates) {
    const payload = buildTemplateSubmissionPayload(template);

    console.log(`📨 ${template.name} (${template.category})`);

    if (dryRun) {
      console.log(JSON.stringify(payload, null, 2));
      console.log('');
    } else {
      try {
        await submitTemplate(payload);
      } catch (err) {
        console.error(`  ❌ Failed: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
