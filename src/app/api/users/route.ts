import { after, NextResponse } from 'next/server';
import { CreateUserRequest, userService } from '@/server/services/userService';
import { CreateFitnessProfileRequest, fitnessProfileService } from '@/server/services/fitnessProfileService';

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.json() as CreateUserRequest & CreateFitnessProfileRequest;
    
    // TODO: Add validation for incoming form data
    
    // Use service layer for user creation
    const user = await userService.createUser({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      age: formData.age,
      gender: formData.gender,
      timezone: formData.timezone,
      preferredSendHour: formData.preferredSendHour,
    });
    
    after(async () => {
      await fitnessProfileService.createFitnessProfile(user, {
        fitnessGoals: formData.fitnessGoals,
        currentExercise: formData.currentExercise,
        injuries: formData.injuries,
      });
    });
    return NextResponse.json({
      success: true,
      userId: user.id,
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