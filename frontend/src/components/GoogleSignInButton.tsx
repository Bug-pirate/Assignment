import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface GoogleSignInButtonProps {
  mode: 'signin' | 'signup';
}

interface GoogleResponse {
  credential: string;
}

interface GoogleConfig {
  client_id: string;
  callback: (response: GoogleResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface ButtonConfig {
  theme: string;
  size: string;
  width: number;
  text: string;
  shape: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: GoogleConfig) => void;
          renderButton: (element: HTMLElement, config: ButtonConfig) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ mode }) => {
  const { login } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleGoogleResponse = useCallback(async (response: GoogleResponse) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[GoogleSignInButton] Raw credential length:', response.credential?.length);
      }
      const apiResponse = await api.googleAuth(response.credential);
      
      if (apiResponse.data?.token && apiResponse.data?.user) {
        login(apiResponse.data.token, apiResponse.data.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      console.error('Google authentication failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
      alert(errorMessage);
    }
  }, [login]);

  useEffect(() => {
    const initializeGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      // DEV SAFETY: detect mismatch between server & client IDs via global variable injection (optional future enhancement)
      if (import.meta.env.DEV) {
        if (!clientId || !clientId.endsWith('.googleusercontent.com')) {
          console.warn('[GoogleSignInButton] Suspicious client ID value:', clientId);
        }
      }
      
      if (!clientId) {
        console.error('Google Client ID not found in environment variables');
        if (buttonRef.current) {
          buttonRef.current.innerHTML = `
            <div class="w-full p-3 border border-red-300 rounded-lg bg-red-50">
              <p class="text-red-600 text-sm">Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in environment.</p>
            </div>
          `;
        }
        return;
      }

      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: buttonRef.current.offsetWidth,
            text: mode === 'signin' ? 'signin_with' : 'signup_with',
            shape: 'rectangular'
          });
        } catch (error) {
          console.error('Google Sign-In initialization failed:', error);
          // Show instructions for setting up Google OAuth
          if (buttonRef.current) {
            buttonRef.current.innerHTML = `
              <div class="w-full space-y-3">
                <div class="p-3 border border-yellow-300 rounded-lg bg-yellow-50">
                  <p class="text-yellow-700 text-sm font-medium">Google OAuth Setup Required</p>
                  <p class="text-yellow-600 text-xs mt-1">To enable Google authentication:</p>
                  <ol class="text-yellow-600 text-xs mt-2 ml-4 list-decimal">
                    <li>Go to Google Cloud Console</li>
                    <li>Create a new project or select existing</li>
                    <li>Enable Google Identity API</li>
                    <li>Create OAuth 2.0 credentials</li>
                    <li>Add http://localhost:5173 to authorized origins</li>
                    <li>Update VITE_GOOGLE_CLIENT_ID in .env file</li>
                  </ol>
                </div>
                <button class="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" disabled>
                  <svg class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#9CA3AF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#9CA3AF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#9CA3AF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#9CA3AF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google OAuth Not Configured
                </button>
              </div>
            `;
          }
        }
      } else {
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initializeGoogle, 500);
      }
    };

    // Wait a bit for the Google script to load
    setTimeout(initializeGoogle, 100);
  }, [mode, handleGoogleResponse]);

  return (
    <div 
      ref={buttonRef} 
      className="w-full"
      style={{ minHeight: '44px' }}
    />
  );
};
