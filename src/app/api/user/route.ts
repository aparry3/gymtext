import { NextResponse } from 'next/server';
import { userService } from '@/server/services/userService';

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.json();
    
    // TODO: Add validation for incoming form data
    
    // Use service layer for user creation
    const result = await userService.createUser({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      timezone: formData.timezone,
      preferredSendHour: formData.preferredSendHour,
      fitnessGoals: formData.fitnessGoals,
      currentExercise: formData.currentExercise,
      injuries: formData.injuries,
    });
    
    return NextResponse.json({
      success: true,
      userId: result.user.id,
      message: 'User created successfully'
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred creating the user' 
      }, 
      { status: 500 }
    );
  }
}