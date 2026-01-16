import type { Insertable, Selectable, Updateable } from 'kysely';
import type { ProgramFamilies, ProgramFamilyPrograms } from './_types';

export type ProgramFamilyDB = Selectable<ProgramFamilies>;
export type NewProgramFamily = Insertable<ProgramFamilies>;
export type ProgramFamilyUpdate = Updateable<ProgramFamilies>;

export type ProgramFamilyProgramDB = Selectable<ProgramFamilyPrograms>;
export type NewProgramFamilyProgram = Insertable<ProgramFamilyPrograms>;
export type ProgramFamilyProgramUpdate = Updateable<ProgramFamilyPrograms>;

/**
 * Family type categorizes how programs are grouped
 */
export type FamilyType =
  | 'category'           // Grouping by workout type (e.g., "Strength", "Cardio")
  | 'owner_collection'   // Coach's own collection of programs
  | 'bundle'             // Purchasable bundle of programs
  | 'curated'            // Editorially curated collection
  | 'system';            // System-managed grouping (e.g., "Recommended for you")

export type FamilyVisibility = 'public' | 'private';

/**
 * Role of a program within a family
 */
export type ProgramFamilyRole = 'primary' | 'addon';

/**
 * Program Family - grouping of related programs
 *
 * Families provide organizational structure:
 * - Categories for discovery (e.g., "Powerlifting Programs")
 * - Coach collections (e.g., "John's Programs")
 * - Bundles for purchasing (e.g., "Complete Fitness Bundle")
 * - Curated lists (e.g., "Best for Beginners")
 */
export interface ProgramFamily {
  id: string;
  ownerId: string | null;
  familyType: FamilyType;
  name: string;
  slug: string;
  description: string | null;
  visibility: FamilyVisibility;
  createdAt: Date;
}

/**
 * Link between a family and a program
 */
export interface ProgramFamilyProgram {
  familyId: string;
  programId: string;
  sortOrder: number;
  role: ProgramFamilyRole | null;
  pinned: boolean;
}

export class ProgramFamilyModel {
  static fromDB(row: ProgramFamilyDB): ProgramFamily {
    return {
      id: row.id,
      ownerId: row.ownerId,
      familyType: row.familyType as FamilyType,
      name: row.name,
      slug: row.slug,
      description: row.description,
      visibility: row.visibility as FamilyVisibility,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
    };
  }
}

export class ProgramFamilyProgramModel {
  static fromDB(row: ProgramFamilyProgramDB): ProgramFamilyProgram {
    return {
      familyId: row.familyId,
      programId: row.programId,
      sortOrder: row.sortOrder,
      role: row.role as ProgramFamilyRole | null,
      pinned: row.pinned,
    };
  }
}
