import { NextResponse } from 'next/server';
import { ChainRunnerService, type ChainOperation } from '@/server/services';

const VALID_OPERATIONS: ChainOperation[] = ['full', 'structured', 'message'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Plan ID is required',
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

    const chainRunnerService = ChainRunnerService.getInstance();
    const result = await chainRunnerService.runFitnessPlanChain(planId, operation);

    return NextResponse.json({
      success: true,
      data: result.data,
      executionTimeMs: result.executionTimeMs,
      operation: result.operation,
    });
  } catch (error) {
    console.error('Error running fitness plan chain:', error);

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
