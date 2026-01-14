import { NextResponse } from 'next/server';
import { parseFile, validateFile, createServicesFromDb, postgresDb } from '@gymtext/shared/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Parse the file to extract raw text
    const parseResult = await parseFile(file);

    // Use the program agent to convert raw text to formatted markdown
    const services = createServicesFromDb(postgresDb);
    const { response: formattedProgram } = await services.programAgent.parseProgram(parseResult.text);

    return NextResponse.json({
      success: true,
      data: {
        ...parseResult,
        formattedProgram, // Add the AI-formatted markdown
      },
    });
  } catch (error) {
    console.error('Error parsing file:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to parse file',
      },
      { status: 500 }
    );
  }
}
