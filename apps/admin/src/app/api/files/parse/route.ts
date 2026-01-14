import { NextResponse } from 'next/server';
import { parseFile, validateFile } from '@gymtext/shared/server';

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

    const parseResult = await parseFile(file);

    return NextResponse.json({
      success: true,
      data: parseResult,
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
