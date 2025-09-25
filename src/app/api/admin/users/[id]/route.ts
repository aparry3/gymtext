import { NextResponse } from 'next/server';
import { userService } from '@/server/services/userService';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          message: 'User ID is required'
        }, 
        { status: 400 }
      );
    }

    const result = await userService.getUserForAdmin(id);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching admin user detail:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { 
          success: false,
          message: 'User not found'
        }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching user'
      }, 
      { status: 500 }
    );
  }
}