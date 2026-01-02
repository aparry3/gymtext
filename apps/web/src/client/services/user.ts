export interface CreateUserRequest {
  name: string;
  phoneNumber: string;
  gender: string;
  age: string;
  fitnessGoals?: string;
  currentExercise?: string;
  injuries?: string;
  preferredSendHour: number;
  timezone: string;
  acceptRisks: boolean;
}

export interface CreateUserResponse {
  success: boolean;
  userId: string;
  message?: string;
}

export async function createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create user');
  }

  return response.json();
}