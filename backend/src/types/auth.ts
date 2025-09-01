
// backend/src/types/auth.ts
export interface JWTPayload {
  userId: string;
  email: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}