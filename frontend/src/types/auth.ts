// frontend/src/types/auth.ts
export interface User {
  _id: string;
  email: string;
  name: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}
