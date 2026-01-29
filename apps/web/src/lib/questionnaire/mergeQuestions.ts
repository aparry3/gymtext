/**
 * Merge Questions
 *
 * Utilities for merging base questions with program-specific questions.
 */

import type { ProgramQuestion } from '@gymtext/shared/server';
import type { QuestionnaireQuestion, QuestionOption } from './types';
import { programBaseQuestions, getProgramQuestionsInsertIndexForProgramBase } from './baseQuestions';

/**
 * Convert ProgramQuestion to QuestionnaireQuestion format
 */
function convertProgramQuestion(pq: ProgramQuestion): QuestionnaireQuestion {
  let type: QuestionnaireQuestion['type'] = 'text';

  switch (pq.questionType) {
    case 'select':
      type = 'select';
      break;
    case 'multiselect':
      type = 'multiselect';
      break;
    case 'boolean':
      type = 'boolean';
      break;
    case 'text':
    case 'scale':
    default:
      type = 'text';
      break;
  }

  const options: QuestionOption[] | undefined = pq.options?.map((opt) => ({
    value: opt,
    label: opt,
  }));

  return {
    id: `program_${pq.id}`,
    questionText: pq.questionText,
    type,
    options,
    required: pq.isRequired,
    helpText: pq.helpText,
    source: 'program',
  };
}

/**
 * Merge program base questions with program-specific questions.
 * For program signups, uses the minimal programBaseQuestions (name, age, gender, phone).
 * Program questions are inserted after gender and before phone.
 */
export function mergeQuestions(programQuestions: ProgramQuestion[] | null): QuestionnaireQuestion[] {
  // Start with minimal program base questions
  const result = [...programBaseQuestions];

  if (!programQuestions || programQuestions.length === 0) {
    return result;
  }

  // Sort program questions by sortOrder
  const sortedProgramQuestions = [...programQuestions].sort((a, b) => a.sortOrder - b.sortOrder);

  // Convert to questionnaire format
  const convertedQuestions = sortedProgramQuestions.map(convertProgramQuestion);

  // Insert after gender, before phone
  const insertIndex = getProgramQuestionsInsertIndexForProgramBase();
  result.splice(insertIndex, 0, ...convertedQuestions);

  return result;
}
