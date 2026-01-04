/**
 * PageVisit Model
 *
 * Represents an anonymous visitor visit to a page.
 * Captures source attribution and basic visitor metadata.
 */
import type { Selectable, Insertable } from 'kysely';
import type { PageVisits } from './_types';
/**
 * Type for selecting page visits from the database
 */
export type PageVisit = Selectable<PageVisits>;
/**
 * Type for inserting page visits into the database
 */
export type NewPageVisit = Insertable<PageVisits>;
//# sourceMappingURL=pageVisit.d.ts.map