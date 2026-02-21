#!/usr/bin/env npx tsx
/**
 * Environment Variable Scanner
 *
 * Scans the codebase for process.env usage and compares against turbo.json
 * configuration. Reports env vars used in code but missing from turbo.json,
 * so they don't silently fail at runtime.
 *
 * Usage:
 *   npx tsx scripts/check-env.ts          # full report
 *   npx tsx scripts/check-env.ts --ci     # exit code 1 if missing vars found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Parse turbo.json
// ---------------------------------------------------------------------------

interface TurboTask {
  env?: string[];
  passThroughEnv?: string[];
}

interface TurboConfig {
  tasks: Record<string, TurboTask>;
}

function getTurboEnvVars(): { byTask: Map<string, Set<string>>; all: Set<string> } {
  const turbo: TurboConfig = JSON.parse(readFileSync(join(ROOT, 'turbo.json'), 'utf-8'));
  const byTask = new Map<string, Set<string>>();
  const all = new Set<string>();

  for (const [task, config] of Object.entries(turbo.tasks)) {
    const vars = new Set<string>();
    for (const v of config.env ?? []) vars.add(v);
    for (const v of config.passThroughEnv ?? []) vars.add(v);
    byTask.set(task, vars);
    for (const v of vars) all.add(v);
  }

  return { byTask, all };
}

// ---------------------------------------------------------------------------
// 2. Scan codebase for process.env references
// ---------------------------------------------------------------------------

interface EnvReference {
  file: string;
  line: number;
  varName: string;
}

const SCAN_DIRS = ['apps', 'packages'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.turbo', '.git']);

// Matches process.env.VAR_NAME (dot notation)
const ENV_REGEX = /process\.env\.([A-Z][A-Z0-9_]*)/g;

function walkDir(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkDir(full));
    } else if (EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) {
      files.push(full);
    }
  }
  return files;
}

function scanCodebase(): { refs: EnvReference[]; byVar: Map<string, EnvReference[]> } {
  const refs: EnvReference[] = [];
  const byVar = new Map<string, EnvReference[]>();

  for (const scanDir of SCAN_DIRS) {
    const absDir = join(ROOT, scanDir);
    for (const file of walkDir(absDir)) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let match: RegExpExecArray | null;
        ENV_REGEX.lastIndex = 0;
        while ((match = ENV_REGEX.exec(lines[i])) !== null) {
          const ref: EnvReference = {
            file: relative(ROOT, file),
            line: i + 1,
            varName: match[1],
          };
          refs.push(ref);
          if (!byVar.has(ref.varName)) byVar.set(ref.varName, []);
          byVar.get(ref.varName)!.push(ref);
        }
      }
    }
  }

  return { refs, byVar };
}

// ---------------------------------------------------------------------------
// 3. Determine which app/package each file belongs to
// ---------------------------------------------------------------------------

function getPackage(filePath: string): string {
  // apps/web/... → web, packages/shared/... → @gymtext/shared
  const parts = filePath.split('/');
  if (parts[0] === 'apps') return parts[1];
  if (parts[0] === 'packages') return `@gymtext/${parts[1]}`;
  return 'root';
}

function getRelevantTasks(pkg: string): string[] {
  // Map package names to turbo task prefixes
  const taskMap: Record<string, string[]> = {
    web: ['web#build', 'build', 'dev'],
    admin: ['admin#build', 'build', 'dev'],
    programs: ['programs#build', 'build', 'dev'],
    '@gymtext/shared': ['@gymtext/shared#build', 'build', 'dev'],
  };
  return taskMap[pkg] ?? ['build', 'dev'];
}

// ---------------------------------------------------------------------------
// 4. Report
// ---------------------------------------------------------------------------

// Env vars that are always available or handled by the framework
const IGNORED_VARS = new Set([
  'NODE_ENV', // Always available in Node.js / Next.js
]);

function run() {
  const ciMode = process.argv.includes('--ci');
  const turbo = getTurboEnvVars();
  const code = scanCodebase();

  // Find vars in code but missing from ALL relevant turbo tasks
  const missing = new Map<string, { refs: EnvReference[]; missingFrom: string[] }>();

  for (const [varName, refs] of code.byVar) {
    if (IGNORED_VARS.has(varName)) continue;

    // Which packages use this var?
    const packages = new Set(refs.map((r) => getPackage(r.file)));

    for (const pkg of packages) {
      const tasks = getRelevantTasks(pkg);
      const missingFrom: string[] = [];

      for (const task of tasks) {
        const taskVars = turbo.byTask.get(task);
        if (taskVars && !taskVars.has(varName)) {
          missingFrom.push(task);
        }
      }

      if (missingFrom.length > 0) {
        const key = `${varName}::${pkg}`;
        if (!missing.has(key)) {
          missing.set(key, { refs: refs.filter((r) => getPackage(r.file) === pkg), missingFrom });
        }
      }
    }
  }

  // Also find vars in turbo.json that aren't used in code
  const unusedInTurbo: { varName: string; tasks: string[] }[] = [];
  const allCodeVars = new Set(code.byVar.keys());
  for (const [task, vars] of turbo.byTask) {
    for (const v of vars) {
      if (!allCodeVars.has(v) && !IGNORED_VARS.has(v)) {
        const existing = unusedInTurbo.find((u) => u.varName === v);
        if (existing) {
          existing.tasks.push(task);
        } else {
          unusedInTurbo.push({ varName: v, tasks: [task] });
        }
      }
    }
  }

  // Print report
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       Environment Variable Scanner Report        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  console.log(`Scanned: ${code.refs.length} references to ${code.byVar.size} unique env vars`);
  console.log(`Turbo config: ${turbo.all.size} env vars across ${turbo.byTask.size} tasks\n`);

  // Missing from turbo.json
  if (missing.size > 0) {
    console.log('❌ MISSING FROM TURBO.JSON');
    console.log('─'.repeat(50));
    console.log('These env vars are used in code but not configured in turbo.json.');
    console.log('They will be undefined at runtime in Turbo-managed builds.\n');

    for (const [key, { refs, missingFrom }] of [...missing].sort((a, b) => a[0].localeCompare(b[0]))) {
      const [varName, pkg] = key.split('::');
      console.log(`  ⚠  ${varName} (${pkg})`);
      console.log(`     Missing from: ${missingFrom.join(', ')}`);
      for (const ref of refs.slice(0, 3)) {
        console.log(`     └─ ${ref.file}:${ref.line}`);
      }
      if (refs.length > 3) {
        console.log(`     └─ ... and ${refs.length - 3} more`);
      }
      console.log();
    }
  } else {
    console.log('✅ All env vars used in code are configured in turbo.json\n');
  }

  // Unused in turbo.json (stale config)
  if (unusedInTurbo.length > 0) {
    console.log('🧹 POSSIBLY STALE IN TURBO.JSON');
    console.log('─'.repeat(50));
    console.log('These env vars are in turbo.json but not found in code.\n');

    for (const { varName, tasks } of unusedInTurbo.sort((a, b) => a.varName.localeCompare(b.varName))) {
      console.log(`  ?  ${varName}`);
      console.log(`     In tasks: ${tasks.join(', ')}`);
    }
    console.log();
  }

  // Summary
  const missingCount = missing.size;
  const staleCount = unusedInTurbo.length;
  console.log('─'.repeat(50));
  console.log(`Missing: ${missingCount}  |  Stale: ${staleCount}`);

  if (ciMode && missingCount > 0) {
    console.log('\n💥 CI check failed: missing env var configurations found.');
    process.exit(1);
  }
}

run();
