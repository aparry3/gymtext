/**
 * Referral Model
 *
 * Represents a referral relationship between two users.
 * Tracks when a user signs up via another user's referral link
 * and whether the referrer has been credited.
 */

import { Selectable, Insertable, Updateable } from 'kysely';
import { Referrals } from './_types';

/**
 * Type for selecting referrals from the database
 */
export type Referral = Selectable<Referrals>;

/**
 * Type for inserting referrals into the database
 */
export type NewReferral = Insertable<Referrals>;

/**
 * Type for updating referrals in the database
 */
export type ReferralUpdate = Updateable<Referrals>;

/**
 * Stats about a user's referral activity
 */
export interface ReferralStats {
  /** User's unique referral code */
  referralCode: string;
  /** Full referral link URL */
  referralLink: string;
  /** Number of completed referrals */
  completedReferrals: number;
  /** Number of credits earned (referrals where credit was applied) */
  creditsEarned: number;
  /** Number of credits remaining until max (12 - earned) */
  creditsRemaining: number;
}

/**
 * Maximum number of referral credits a user can earn
 */
export const MAX_REFERRAL_CREDITS = 12;

/**
 * Amount credited per referral in cents ($19.99)
 */
export const REFERRAL_CREDIT_AMOUNT_CENTS = 1999;
