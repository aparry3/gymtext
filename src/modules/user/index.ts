// Domain models
export { User, CreateUserInput, UpdateUserInput } from './domain/models/User';
export { 
  FitnessProfile, 
  SkillLevel, 
  ExerciseFrequency, 
  Gender,
  CreateFitnessProfileInput,
  UpdateFitnessProfileInput 
} from './domain/models/FitnessProfile';

// Domain interfaces
export { IUserRepository } from './domain/interfaces/IUserRepository';
export { IUserService } from './domain/interfaces/IUserService';

// Infrastructure
export { UserRepository } from './infrastructure/repositories/UserRepository';
export { UserMapper } from './infrastructure/mappers/UserMapper';

// Application
export { UserService } from './application/services/UserService';

// API
export {
  UserResponseDto,
  FitnessProfileResponseDto,
  UserWithProfileResponseDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  CreateFitnessProfileRequestDto
} from './api/dtos/UserDto';
export { UserDtoMapper } from './api/mappers/UserDtoMapper';