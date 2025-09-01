// frontend/src/contexts/AuthContext.ts
import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
