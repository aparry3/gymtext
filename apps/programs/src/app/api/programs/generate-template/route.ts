export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateFile, parseFile, createProgramAgentService, createServicesFromDb, postgresDb } from '@gymtext/shared/server';

/**
 * POST /api/programs/generate-template
 *
 * Accepts a file upload (PDF, CSV, XLSX, TXT), extracts text content,
 * and uses AI to generate a structured workout template markdown.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const ownerId = cookieStore.get('gt_programs_owner')?.value;

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Extract text from file
    const parsed = await parseFile(file);

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Could not extract text from file' },
        { status: 400 }
      );
    }

    // Generate template using program agent
    const services = createServicesFromDb(postgresDb);
    const service = createProgramAgentService(services.agentDefinition);
    const result = await service.parseProgram(parsed.text);

    return NextResponse.json({
      success: true,
      data: { templateMarkdown: result.response },
    });
  } catch (error) {
    console.error('[Generate Template] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
