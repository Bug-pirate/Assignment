// backend/src/services/googleAuth.ts
import { OAuth2Client } from 'google-auth-library';
import { GoogleUserInfo } from '../types/auth.js';

const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);

export const verifyGoogleToken = async (token: string): Promise<GoogleUserInfo | null> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return null;
    }

    if (payload.aud !== clientId) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture!,
      email_verified: payload.email_verified!
    };
  } catch (error) {
    console.error('Google token verification failed:', (error as any)?.message || error);
    return null;
  }
};
