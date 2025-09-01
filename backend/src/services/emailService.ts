// backend/src/services/emailService.ts
import nodemailer from 'nodemailer';

// Helper to mask sensitive values
const mask = (val?: string) => val ? val[0] + '***' + val.slice(-2) : 'undefined';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function buildTransporter(): Promise<nodemailer.Transporter> {
  // Use real SMTP if credentials provided
  const legacyUser = process.env.EMAIL_USER || process.env.MAIL_USER; // legacy support
  const legacyPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || (process.env as any).EAMIL_PASS; // handle common typos
  const smtpUser = process.env.SMTP_USER || legacyUser;
  const smtpPass = process.env.SMTP_PASS || legacyPass;
  if (smtpUser && smtpPass) {
    const real = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass }
    });
    try {
      await real.verify();
      console.log('[Email] Real SMTP transporter verified:', {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || '587',
        secure: process.env.SMTP_SECURE === 'true'
      });
      return real;
    } catch (err: any) {
      console.error('[Email] Real SMTP verification failed, falling back to Ethereal:', err?.message || err);
    }
  }

  if (process.env.DISABLE_ETHEREAL === 'true') {
    throw new Error('[Email] Real SMTP credentials missing and Ethereal fallback disabled (set SMTP_USER / SMTP_PASS or remove DISABLE_ETHEREAL).');
  }

  // Ethereal fallback
  const testAccount = await nodemailer.createTestAccount();
  console.log('[Email] Using Ethereal test account:', mask(testAccount.user));
  const ethereal = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  return ethereal;
}

async function getTransporter() {
  if (!transporterPromise) transporterPromise = buildTransporter();
  return transporterPromise;
}

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@notesapp.com',
    to: email,
    subject: 'Email Verification - Notes App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your OTP for email verification is:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP email queued to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[Email] Preview URL (Ethereal):', previewUrl);
    }
  } catch (error: any) {
    console.error('[Email] Sending failed:', error?.response || error?.message || error);
    if (error?.code === 'EAUTH') {
      console.error('[Email] Authentication failed. Ensure SMTP_USER / SMTP_PASS are correct (Gmail: use App Password).');
    } else if (error?.code === 'ENOTFOUND') {
      console.error('[Email] Host not found. Check SMTP_HOST.');
    } else if (error?.code === 'ETIMEDOUT') {
      console.error('[Email] Connection timed out. Network / firewall issue possible.');
    }
    throw new Error('Failed to send OTP email');
  }
};
