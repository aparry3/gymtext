export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

export interface SoftDelete {
  deleted_at: Date | null;
}

export interface Metadata {
  [key: string]: string | number | boolean | null | undefined;
}