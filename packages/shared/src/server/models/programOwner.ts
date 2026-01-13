import type { Insertable, Selectable, Updateable } from 'kysely';
import type { ProgramOwners } from './_types';

export type ProgramOwnerDB = Selectable<ProgramOwners>;
export type NewProgramOwner = Insertable<ProgramOwners>;
export type ProgramOwnerUpdate = Updateable<ProgramOwners>;

export type OwnerType = 'ai' | 'coach' | 'trainer' | 'influencer';

export interface ProgramOwner {
  id: string;
  userId: string | null;
  ownerType: OwnerType;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  stripeConnectAccountId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProgramOwnerModel {
  static fromDB(row: ProgramOwnerDB): ProgramOwner {
    return {
      id: row.id,
      userId: row.userId,
      ownerType: row.ownerType as OwnerType,
      displayName: row.displayName,
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      stripeConnectAccountId: row.stripeConnectAccountId,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }
}
