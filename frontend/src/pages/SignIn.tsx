import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { AbstractBackground } from '../components/AbstractBackground';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
declare global {
  interface Window { google?: { accounts?: { id?: unknown } } }
}
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const signinSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
  keepLoggedIn: z.boolean().optional(),
});

type SigninFormData = z.infer<typeof signinSchema>;

export const SignIn = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
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
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onGetOtp = async (data: SigninFormData) => {
    try {
      setError('');
      const response = await apiService.signIn(data.email);

      if (response.success) {
        setUserEmail(data.email);
        setStep('otp');
        interface DevData { devOtp?: string; emailSent?: boolean }
        const devData = response.data as DevData | undefined;
        if (devData?.devOtp) setDevOtp(devData.devOtp);
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

  const onSignIn = async (data: SigninFormData) => {
    try {
      setError('');
      if (!data.otp) {
        setError('Please enter OTP');
        return;
      }

      const response = await apiService.verifySignInOTP({
        email: userEmail,
        otp: data.otp,
        keepLoggedIn: data.keepLoggedIn,
      });

      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      } else {
        setError(response.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      const response = await apiService.resendOTP(userEmail);
      
      if (response.success) {
        interface DevData { devOtp?: string; emailSent?: boolean }
        const devData = response.data as DevData | undefined;
        if (devData?.devOtp) setDevOtp(devData.devOtp);
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

  const handleFormSubmit = step === 'email' ? onGetOtp : onSignIn;

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
              <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
              <p className="mt-2 text-gray-600">Please login to continue to your account.</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

              {/* OTP - Only show in OTP step */}
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
                </div>
              )}

              {/* Resend OTP - Only show in OTP step */}
              {step === 'otp' && (
                <div className="text-left">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-blue-500 text-sm hover:text-blue-600"
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {/* Keep me logged in - Only show in OTP step */}
              {step === 'otp' && (
                <div className="flex items-center">
                  <input
                    {...register('keepLoggedIn')}
                    type="checkbox"
                    id="keepLoggedIn"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-600">
                    Keep me logged in
                  </label>
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
                ) : step === 'email' ? (
                  'Get OTP'
                ) : (
                  'Sign in'
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
            <GoogleSignInButton mode="signin" />

                    {devOtp && (
                      <p className="text-xs text-gray-500 mt-1">Dev OTP: <span className="font-mono tracking-widest">{devOtp}</span></p>
                    )}
            {/* Create Account Link */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Need an account?{' '}
                <Link to="/signup" className="text-blue-500 hover:text-blue-600">
                  Create one
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
