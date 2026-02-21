/**
 * Questionnaire Types
 *
 * Types for the full-page clickthrough signup questionnaire.
 */

export type QuestionType = 'select' | 'multiselect' | 'text' | 'phone' | 'boolean';

export interface QuestionOption {
  /** Value stored in answers */
  value: string;
  /** Display label */
  label: string;
  /** Optional description shown below the label */
  description?: string;
}

export interface QuestionnaireQuestion {
  /** Unique identifier */
  id: string;
  /** Question text displayed to the user */
  questionText: string;
  /** Type of question */
  type: QuestionType;
  /** Options for select/multiselect questions */
  options?: QuestionOption[];
  /** Whether this question is required */
  required: boolean;
  /** Optional subtitle/help text */
  helpText?: string;
  /** For multiselect: max number of selections */
  maxSelections?: number;
  /** For text: input placeholder */
  placeholder?: string;
  /** Source: 'base' or 'program' */
  source: 'base' | 'program';
  /** Conditional: only show this question if the parent question has this value */
  showIfAnswerEquals?: string;
  /** Conditional: show this question if the answer includes this value (for multiselect) */
  showIfAnswerContains?: string;
  /** Conditional: hide this question if the parent question has this value */
  hideIfAnswerEquals?: string | string[];
  /** Conditional: hide this question if the answer includes this value (for multiselect) */
  hideIfAnswerContains?: string;
}

export interface QuestionnaireState {
  /** Program ID if applicable */
  programId?: string;
  /** All questions in order */
  questions: QuestionnaireQuestion[];
  /** Current question index (0-based) */
  currentIndex: number;
  /** Collected answers keyed by question ID */
  answers: Record<string, string | string[]>;
  /** Direction of last navigation (for animation) */
  direction: 'forward' | 'backward';
}

export interface QuestionnaireAnswers {
  // Base question answers (matching existing signup API)
  primaryGoals: string[];
  experienceLevel: string;
  desiredDaysPerWeek: string;
  trainingLocation: string;
  equipment: string[];
  name: string;
  phoneNumber: string;
  // Program-specific answers
  programAnswers?: Record<string, string | string[]>;
}

export const STORAGE_KEY = 'gymtext_questionnaire';
