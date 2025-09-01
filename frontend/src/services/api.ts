const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SignUpData {
  name: string;
  email: string;
  dateOfBirth: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
  keepLoggedIn?: boolean;
}

interface AuthResponseData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    dateOfBirth: string;
  };
}

class ApiService {
  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || data.error || 'Request failed';
        if (data.errors && Array.isArray(data.errors)) {
          type FieldErr = { msg?: string; message?: string };
          const fieldMsgs = (data.errors as FieldErr[])
            .map((e) => e.msg || e.message)
            .filter((m): m is string => Boolean(m));
            if (fieldMsgs.length) {
              errorMessage = fieldMsgs.join(', ');
            }
        }
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  async signUp(userData: SignUpData): Promise<ApiResponse> {
    return this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(email: string): Promise<ApiResponse> {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifySignUpOTP(data: VerifyOTPData): Promise<ApiResponse<AuthResponseData>> {
    return this.makeRequest<AuthResponseData>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifySignInOTP(data: VerifyOTPData): Promise<ApiResponse<AuthResponseData>> {
    return this.makeRequest<AuthResponseData>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendOTP(email: string): Promise<ApiResponse> {
    return this.makeRequest('/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async googleAuth(idToken: string): Promise<ApiResponse<AuthResponseData>> {
    return this.makeRequest<AuthResponseData>('/google', {
      method: 'POST',
      body: JSON.stringify({ token: idToken })
    });
  }
}

export const apiService = new ApiService();
export default apiService;
