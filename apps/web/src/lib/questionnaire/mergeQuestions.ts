/**
 * Merge Questions
 *
 * Utilities for merging base questions with program-specific questions.
 */

import type { ProgramQuestion } from '@gymtext/shared/server';
import type { QuestionnaireQuestion, QuestionOption } from './types';
import { baseQuestions, getProgramQuestionsInsertIndex } from './baseQuestions';

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
 * Merge base questions with program-specific questions.
 * Program questions are inserted after equipment and before name/phone.
 */
export function mergeQuestions(programQuestions: ProgramQuestion[] | null): QuestionnaireQuestion[] {
  if (!programQuestions || programQuestions.length === 0) {
    return [...baseQuestions];
  }

  // Sort program questions by sortOrder
  const sortedProgramQuestions = [...programQuestions].sort((a, b) => a.sortOrder - b.sortOrder);

  // Convert to questionnaire format
  const convertedQuestions = sortedProgramQuestions.map(convertProgramQuestion);

  // Insert at the right position
  const insertIndex = getProgramQuestionsInsertIndex();
  const result = [...baseQuestions];
  result.splice(insertIndex, 0, ...convertedQuestions);

  return result;
}
