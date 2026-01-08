import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { ChainOperation } from '@gymtext/shared/server';

const VALID_OPERATIONS: ChainOperation[] = ['full', 'structured', 'message'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ microcycleId: string }> }
) {
  try {
    const { microcycleId } = await params;

    if (!microcycleId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Microcycle ID is required',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const operation = body.operation as ChainOperation;

    if (!operation || !VALID_OPERATIONS.includes(operation)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid operation. Must be one of: ${VALID_OPERATIONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const result = await services.chainRunner.runMicrocycleChain(microcycleId, operation);

    return NextResponse.json({
      success: true,
      data: result.data,
      executionTimeMs: result.executionTimeMs,
      operation: result.operation,
    });
  } catch (error) {
    console.error('Error running microcycle chain:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred running the chain',
      },
      { status: 500 }
    );
  }
}
