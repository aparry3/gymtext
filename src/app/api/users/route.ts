import { NextResponse } from 'next/server';
import { CreateUserRequest, userService } from '@/server/services/userService';
import { CreateFitnessProfileRequest, fitnessProfileService } from '@/server/services/fitnessProfileService';
import { setUserCookie } from '@/shared/utils/cookies';

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

    // Wait for fitness profile creation (needed for program generation)
    await fitnessProfileService.createFitnessProfile(user, {
      fitnessGoals: formData.fitnessGoals,
      currentExercise: formData.currentExercise,
      injuries: formData.injuries,
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      message: 'User created successfully'
    });

    // Set authentication cookie
    setUserCookie(response, {
      id: user.id,
      name: user.name,
      isCustomer: true, // Set to true since we're removing payment
      checkoutCompleted: true, // Set to true since there's no checkout
      timestamp: new Date().toISOString(),
    });

    return response;

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