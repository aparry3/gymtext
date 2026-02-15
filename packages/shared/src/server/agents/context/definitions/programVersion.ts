import type { ContextProvider } from '../types';
import type { UserWithProfile } from '@/server/models';
import type { EnrollmentServiceInstance } from '@/server/services/domain/program/enrollmentService';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';
import { resolveTemplate } from '@/server/agents/declarative/templateEngine';

const DEFAULT_TEMPLATE = 'Program template:\n\n{{content}}';

export function createProgramVersionProvider(deps: {
  enrollmentService: EnrollmentServiceInstance;
  contextTemplateService: ContextTemplateServiceInstance;
}): ContextProvider {
  return {
    name: 'programVersion',
    description: 'Program version template content for enrolled users',
    params: { required: ['user'] },
    templateVariables: ['content'],
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      const enrollmentWithVersion = await deps.enrollmentService.getEnrollmentWithProgramVersion(user.id);
      const content = enrollmentWithVersion?.programVersion?.templateMarkdown?.trim() || '';

      if (!content) return '';

      const template = await deps.contextTemplateService.getTemplate('programVersion') ?? DEFAULT_TEMPLATE;
      return resolveTemplate(template, { content });
    },
  };
}
