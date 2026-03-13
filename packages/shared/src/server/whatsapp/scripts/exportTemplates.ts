#!/usr/bin/env npx tsx
/**
 * Export WhatsApp templates as JSON files for manual submission via Meta Business Manager.
 *
 * Usage:
 *   npx tsx packages/shared/src/server/whatsapp/scripts/exportTemplates.ts
 *
 * Outputs JSON files to packages/shared/src/server/whatsapp/templates-json/
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ALL_TEMPLATES, buildTemplateSubmissionPayload } from '../templates';

const OUTPUT_DIR = join(__dirname, '..', 'templates-json');

function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n📦 Exporting ${ALL_TEMPLATES.length} templates to ${OUTPUT_DIR}\n`);

  for (const template of ALL_TEMPLATES) {
    const payload = buildTemplateSubmissionPayload(template);
    const filename = `${template.name}.json`;
    const filepath = join(OUTPUT_DIR, filename);

    writeFileSync(filepath, JSON.stringify(payload, null, 2) + '\n');
    console.log(`  ✅ ${filename}`);
  }

  // Also write a combined file
  const allPayloads = ALL_TEMPLATES.map(buildTemplateSubmissionPayload);
  const combinedPath = join(OUTPUT_DIR, '_all_templates.json');
  writeFileSync(combinedPath, JSON.stringify(allPayloads, null, 2) + '\n');
  console.log(`  ✅ _all_templates.json (combined)`);

  console.log('\nDone!');
}

main();
