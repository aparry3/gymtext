// import { UserRepository } from '@/server/repositories/userRepository';
// import { ProfileUpdateRepository, NewProfileUpdate } from '@/server/repositories/profileUpdateRepository';
// import { FitnessProfileSchema } from '@/server/models/user/schemas';
// import type { FitnessProfile, UserWithProfile } from '@/server/models/userModel';

// export interface ProfilePatchOptions {
//   source: string;
//   reason: string;
//   path?: string;
// }

// export class ProfilePatchService {
//   private userRepo: UserRepository;
//   private profileUpdateRepo: ProfileUpdateRepository;

//   constructor() {
//     this.userRepo = new UserRepository();
//     this.profileUpdateRepo = new ProfileUpdateRepository();
//   }

//   /**
//    * Patch a user's profile with the provided updates
//    * This performs a deep merge and creates an audit trail
//    */
//   async patchProfile(
//     userId: string,
//     updates: Partial<FitnessProfile>,
//     options: ProfilePatchOptions
//   ): Promise<UserWithProfile> {
//     try {
//       // Validate the updates against the schema
//       const validatedUpdates = FitnessProfileSchema.partial().parse(updates);

//       // Deep merge logic for nested objects and arrays
//       const mergedUpdates = this.prepareMergedUpdates(validatedUpdates);

//       // Start a transaction (if needed - Kysely handles this)
//       // For now, we'll do the operations sequentially

//       // 1. Update the user's profile using JSONB merge
//       const updatedUser = await this.userRepo.patchProfile(userId, mergedUpdates);

//       // 2. Create audit trail record
//       const updateRecord: NewProfileUpdate = {
//         userId,
//         patch: JSON.parse(JSON.stringify(mergedUpdates)), // Ensure it's a plain object
//         source: options.source,
//         reason: options.reason,
//         path: options.path || null,
//       };

//       await this.profileUpdateRepo.create(updateRecord);

//       return updatedUser;
//     } catch (error) {
//       console.error('ProfilePatchService error:', error);
//       throw new Error(`Failed to patch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   /**
//    * Prepare updates for merging, handling special cases like arrays
//    */
//   private prepareMergedUpdates(updates: Partial<FitnessProfile>): Partial<FitnessProfile> {
//     const prepared: Partial<FitnessProfile> = {};

//     for (const [key, value] of Object.entries(updates)) {
//       if (value === undefined) continue;

//       // Handle constraints array specially - append new constraints
//       if (key === 'constraints' && Array.isArray(value)) {
//         // For constraints, we typically want to append new ones
//         // The JSONB merge will replace the array, so we need to handle this
//         // in the future with a custom merge strategy
//         (prepared as Record<string, unknown>)[key] = value;
//       }
//       // Handle nested objects
//       else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
//         // For nested objects like availability, equipment, etc.
//         // The JSONB merge will deep merge these automatically
//         (prepared as Record<string, unknown>)[key] = value;
//       }
//       // Handle primitive values and arrays
//       else {
//         (prepared as Record<string, unknown>)[key] = value;
//       }
//     }

//     return prepared;
//   }

//   /**
//    * Get the update history for a user
//    */
//   async getUserUpdateHistory(userId: string, limit: number = 10) {
//     return await this.profileUpdateRepo.getUserUpdates(userId, limit);
//   }

//   /**
//    * Validate if an update should be applied based on confidence
//    */
//   validateConfidence(confidence: number, threshold: number = 0.5): boolean {
//     return confidence >= threshold;
//   }

//   /**
//    * Get a summary of fields that were updated
//    */
//   getUpdateSummary(updates: Partial<FitnessProfile>): string[] {
//     const fields: string[] = [];
    
//     const processObject = (obj: Record<string, unknown>, prefix: string = '') => {
//       for (const [key, value] of Object.entries(obj)) {
//         if (value === undefined || value === null) continue;
        
//         const fieldPath = prefix ? `${prefix}.${key}` : key;
        
//         if (typeof value === 'object' && !Array.isArray(value)) {
//           processObject(value as Record<string, unknown>, fieldPath);
//         } else {
//           fields.push(fieldPath);
//         }
//       }
//     };

//     processObject(updates as Record<string, unknown>);
//     return fields;
//   }

//   /**
//    * Merge constraints intelligently (append new, update existing)
//    */
//   private mergeConstraints(
//     existing: FitnessProfile['constraints'],
//     updates: FitnessProfile['constraints']
//   ): FitnessProfile['constraints'] {
//     if (!updates || updates.length === 0) return existing;
//     if (!existing || existing.length === 0) return updates;

//     // Create a map of existing constraints by ID
//     const constraintMap = new Map(
//       existing.map(c => [c.id, c])
//     );

//     // Update existing or add new constraints
//     for (const constraint of updates) {
//       constraintMap.set(constraint.id, constraint);
//     }

//     return Array.from(constraintMap.values());
//   }
// }