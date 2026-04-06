'use client';

/**
 * StartClient
 *
 * Client wrapper for the questionnaire. Receives all data as props from the server component.
 */

import { Questionnaire } from '@/components/questionnaire/Questionnaire';
import type { QuestionnaireQuestion } from '@/lib/questionnaire/types';

interface StartClientProps {
  programId?: string;
  programName?: string;
  ownerWordmarkUrl?: string;
  ownerDisplayName?: string;
  questions: QuestionnaireQuestion[];
}

export function StartClient({
  programId,
  programName,
  ownerWordmarkUrl,
  ownerDisplayName,
  questions,
}: StartClientProps) {
  return (
    <Questionnaire
      programId={programId}
      programName={programName}
      ownerWordmarkUrl={ownerWordmarkUrl}
      ownerDisplayName={ownerDisplayName}
      questions={questions}
    />
  );
}
