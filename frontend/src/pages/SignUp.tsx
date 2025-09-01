import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { AbstractBackground } from '../components/AbstractBackground';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
declare global { interface Window { google?: { accounts?: { id?: unknown } } } }
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignUp = () => {
  const [step, setStep] = useState<'initial' | 'otp'>('initial');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string | undefined>();
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  // getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onGetOtp = async (data: SignupFormData) => {
    try {
      setError('');
      const response = await apiService.signUp({
        name: data.name,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
      });

      if (response.success) {
        setUserEmail(data.email);
        setStep('otp');
          interface DevData { devOtp?: string; emailSent?: boolean }
        const devData = response.data as DevData | undefined;
        if (devData?.devOtp) {
          setDevOtp(devData.devOtp);
        }
          if (devData && devData.emailSent === false) {
            setError('Email delivery failed. Use the displayed OTP to continue.');
          }
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error getting OTP:', error);
      setError('Network error. Please try again.');
    }
  };

  const onSignUp = async (data: SignupFormData) => {
    try {
      setError('');
      if (!data.otp) {
        setError('Please enter OTP');
        return;
      }

      const response = await apiService.verifySignUpOTP({
        email: userEmail,
        otp: data.otp,
      });

      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      } else {
        setError(response.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      const response = await apiService.resendOTP(userEmail);
      
      if (response.success) {
        interface DevData { devOtp?: string }
          interface DevData { devOtp?: string; emailSent?: boolean }
        const devData = response.data as DevData | undefined;
        if (devData?.devOtp) {
          setDevOtp(devData.devOtp);
        }
          if (devData && devData.emailSent === false) {
            setError('Email delivery failed. Use the displayed OTP to continue.');
          }
      } else if (!response.success) {
        setError(response.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleFormSubmit = step === 'initial' ? onGetOtp : onSignUp;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-white flex-1">
        <div className="w-full max-w-md space-y-6 lg:space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo />
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
              <p className="mt-2 text-gray-600">Sign up to enjoy the feature of HD</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Jonas Khanwald"
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  defaultValue="1997-12-11"
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-blue-500 mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="jonas_kahnwald@gmail.com"
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* OTP Field - Only show in OTP step */}
              {step === 'otp' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">OTP</label>
                  <div className="relative">
                    <input
                      {...register('otp')}
                      type={showOtp ? 'text' : 'password'}
                      placeholder="Enter OTP"
                      className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtp(!showOtp)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
                  )}
                  {devOtp && (
                    <p className="text-xs text-gray-500 mt-1">Dev OTP: <span className="font-mono tracking-widest">{devOtp}</span></p>
                  )}
                  
                  {/* Resend OTP */}
                  <div className="text-left">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-blue-500 text-sm hover:text-blue-600"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Loading...</span>
                ) : step === 'initial' ? (
                  'Get OTP'
                ) : (
                  'Sign up'
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Sign In */}
            <GoogleSignInButton mode="signup" />

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/signin" className="text-blue-500 hover:text-blue-600">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Abstract Background */}
      <AbstractBackground />
    </div>
  );
};
