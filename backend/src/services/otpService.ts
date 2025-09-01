// backend/src/services/otpService.ts
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};
