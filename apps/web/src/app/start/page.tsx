/**
 * Start Page (Server Component)
 *
 * SSR questionnaire for new user signup.
 * Fetches program data server-side when ?program= is provided.
 */

import { getRepositories, getServices } from '@/lib/context';
import { baseQuestions } from '@/lib/questionnaire/baseQuestions';
import { mergeQuestions } from '@/lib/questionnaire/mergeQuestions';
import { StartClient } from './StartClient';

interface StartPageProps {
  searchParams: Promise<{ program?: string }>;
}

export default async function StartPage({ searchParams }: StartPageProps) {
  const { program: programId } = await searchParams;

  if (!programId) {
    return <StartClient questions={baseQuestions} />;
  }

  const services = getServices();
  const repos = getRepositories();

  const programVersion = await services.programVersion.getLatestPublished(programId);

  if (!programVersion) {
    // Program not found, fall back to base questions
    return <StartClient questions={baseQuestions} />;
  }

  const program = await repos.program.findById(programId);
  const owner = program ? await repos.programOwner.findById(program.ownerId) : null;

  const questions = mergeQuestions(programVersion.questions);

  return (
    <StartClient
      programId={programId}
      programName={program?.name || programId}
      ownerWordmarkUrl={owner?.wordmarkUrl || undefined}
      ownerDisplayName={owner?.displayName || undefined}
      questions={questions}
    />
  );
}
