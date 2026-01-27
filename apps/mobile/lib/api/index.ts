// API Modules
export { apiClient, getErrorMessage, onAuthExpired } from './client';
export { authApi } from './auth';
export { tripApi } from './trip';
export { expenseApi } from './expense';
export { syncApi } from './sync';

// Types
export type { AuthResponse, User, RegisterDto, LoginDto, SocialLoginDto } from './auth';
export type { CreateTripDto, CreateDestinationDto, UpdateTripDto, TripResponse } from './trip';
export type { CreateExpenseDto, UpdateExpenseDto, ExpenseFilters } from './expense';
export type { SyncChange, SyncConflict, SyncPushDto, SyncPushResponse } from './sync';
