import { Kysely } from 'kysely';
import { DB } from '../models/_types';
import { FitnessProfile, ProfileUpdateOp, Constraint } from '../models/fitnessProfile';
import { FitnessProfileRepository } from '../repositories/fitnessProfileRepository';
import { v4 as uuidv4 } from 'uuid';

export class ProfileUpdateService {
  private profileRepo: FitnessProfileRepository;

  constructor(private db: Kysely<DB>) {
    this.profileRepo = new FitnessProfileRepository(db);
  }

  /**
   * Apply a patch to the profile (deep merge)
   */
  async applyPatch(
    userId: string,
    patch: Partial<FitnessProfile>,
    source: string,
    reason?: string
  ): Promise<FitnessProfile> {
    // Get current profile
    const current = await this.profileRepo.getProfile(userId);
    
    // Deep merge patch with existing profile
    const merged = this.deepMerge(current, patch);
    
    // Update profile in database
    await this.profileRepo.upsertProfile(userId, merged, this.extractLegacyFields(merged));
    
    // Record update in ledger
    await this.recordUpdate(userId, patch, null, source, reason);
    
    return merged;
  }

  /**
   * Apply a structured operation to the profile
   */
  async applyOp(
    userId: string,
    op: ProfileUpdateOp,
    source: string,
    reason?: string
  ): Promise<FitnessProfile> {
    const current = await this.profileRepo.getProfile(userId);
    let patch: Partial<FitnessProfile> = {};
    
    switch (op.kind) {
      case 'add_constraint': {
        const id = op.constraint.id ?? uuidv4();
        const newConstraint: Constraint = {
          id,
          type: op.constraint.type,
          label: op.constraint.label,
          severity: op.constraint.severity,
          affectedAreas: op.constraint.affectedAreas,
          modifications: op.constraint.modifications,
          startDate: op.constraint.startDate,
          endDate: op.constraint.endDate,
          status: op.constraint.status || 'active',
        };
        
        patch = {
          constraints: [...(current.constraints || []), newConstraint],
        };
        break;
      }
      
      case 'update_constraint': {
        if (!current.constraints) {
          throw new Error(`No constraints found to update`);
        }
        
        patch = {
          constraints: current.constraints.map(c =>
            c.id === op.id ? { ...c, ...op.patch } : c
          ),
        };
        break;
      }
      
      case 'resolve_constraint': {
        if (!current.constraints) {
          throw new Error(`No constraints found to resolve`);
        }
        
        const endDate = op.endDate || new Date().toISOString().slice(0, 10);
        patch = {
          constraints: current.constraints.map(c =>
            c.id === op.id
              ? { ...c, status: 'resolved' as const, endDate }
              : c
          ),
        };
        break;
      }
      
      case 'set': {
        patch = this.setByJsonPointer(current, op.path, op.value);
        break;
      }
      
      default:
        throw new Error(`Unknown operation kind: ${(op as any).kind}`);
    }
    
    return this.applyPatch(userId, patch, source, reason);
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] === null || source[key] === undefined) {
        continue;
      }
      
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // Nested object - recurse
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        // Primitive or array - replace
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Set a value by JSON pointer path
   */
  private setByJsonPointer(obj: any, path: string, value: any): any {
    // Convert JSON pointer to object path
    // e.g., "/metrics/bodyweight/value" -> ["metrics", "bodyweight", "value"]
    const parts = path.split('/').filter(p => p !== '');
    
    if (parts.length === 0) {
      return value;
    }
    
    // Build patch object
    const patch: any = {};
    let current = patch;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    
    return patch;
  }

  /**
   * Record update in ledger
   */
  private async recordUpdate(
    userId: string,
    patch: any,
    path: string | null,
    source: string,
    reason?: string
  ): Promise<void> {
    await this.db
      .insertInto('profileUpdates')
      .values({
        userId,
        patch: JSON.stringify(patch),
        path,
        source,
        reason,
        createdAt: new Date(),
      })
      .execute();
  }

  /**
   * Extract legacy fields from profile for backward compatibility
   */
  private extractLegacyFields(profile: FitnessProfile): {
    age?: number;
    gender?: string;
    skillLevel?: string;
    fitnessGoals?: string;
    exerciseFrequency?: string;
  } {
    const frequency = profile.availability?.daysPerWeek;
    let exerciseFrequency = '3-4 times a week';
    
    if (frequency) {
      if (frequency >= 7) exerciseFrequency = 'daily';
      else if (frequency >= 5) exerciseFrequency = '5-6 times a week';
      else if (frequency >= 3) exerciseFrequency = '3-4 times a week';
      else exerciseFrequency = '1-2 times a week';
    }
    
    return {
      age: profile.identity?.age,
      gender: profile.identity?.gender,
      skillLevel: profile.experienceLevel,
      fitnessGoals: profile.primaryGoal,
      exerciseFrequency,
    };
  }

  /**
   * Get profile with context
   */
  async getProfileWithContext(userId: string): Promise<{
    profile: FitnessProfile;
    context: { facts: any; prose: string };
  }> {
    const { AIContextService } = await import('./aiContextService');
    const contextService = new AIContextService();
    
    const profile = await this.profileRepo.getProfile(userId);
    const context = contextService.buildAIContext(profile);
    
    return { profile, context };
  }
}