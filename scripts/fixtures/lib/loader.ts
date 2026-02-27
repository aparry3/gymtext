import fs from 'fs';
import path from 'path';
import type { AgentFixture } from './types';

const FIXTURES_DIR = path.resolve(__dirname, '../agents');

/** Convert agent ID to directory name: 'profile:update' -> 'profile-update' */
export function agentIdToDir(agentId: string): string {
  return agentId.replace(/:/g, '-');
}

/** Convert directory name back to agent ID: 'profile-update' -> 'profile:update' */
export function dirToAgentId(dir: string): string {
  return dir.replace(/-/, ':');
}

/** Load a single fixture by file path */
export function loadFixture(filePath: string): AgentFixture {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const fixture = JSON.parse(raw) as AgentFixture;
  validateFixture(fixture, filePath);
  return fixture;
}

/** Load all fixtures for a given agent ID */
export function loadFixturesByAgent(agentId: string): AgentFixture[] {
  const dir = path.join(FIXTURES_DIR, agentIdToDir(agentId));
  if (!fs.existsSync(dir)) return [];
  return loadFixturesFromDir(dir);
}

/** Load all fixtures for a given persona */
export function loadFixturesByPersona(persona: string): AgentFixture[] {
  const all = loadAllFixtures();
  return all.filter(f => f.persona === persona);
}

/** Load all fixtures across all agents */
export function loadAllFixtures(): AgentFixture[] {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  const agentDirs = fs.readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(FIXTURES_DIR, d.name));
  return agentDirs.flatMap(loadFixturesFromDir);
}

/** List available fixtures (summary info only) */
export function listFixtures(): Array<{ id: string; agentId: string; persona: string; path: string }> {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  const agentDirs = fs.readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(FIXTURES_DIR, d.name));

  return agentDirs.flatMap(dir => {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.fixture.json'))
      .map(f => {
        const filePath = path.join(dir, f);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const fixture = JSON.parse(raw) as AgentFixture;
        return {
          id: fixture.id,
          agentId: fixture.agentId,
          persona: fixture.persona,
          path: filePath,
        };
      });
  });
}

/** Load all .fixture.json files from a directory */
function loadFixturesFromDir(dir: string): AgentFixture[] {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.fixture.json'))
    .map(f => loadFixture(path.join(dir, f)));
}

/** Validate a fixture has required fields */
function validateFixture(fixture: AgentFixture, filePath: string): void {
  const required = ['id', 'agentId', 'persona', 'description', 'tags'] as const;
  for (const field of required) {
    if (!fixture[field]) {
      throw new Error(`Fixture ${filePath} missing required field: ${field}`);
    }
  }
  if (!Array.isArray(fixture.tags)) {
    throw new Error(`Fixture ${filePath}: tags must be an array`);
  }
}
