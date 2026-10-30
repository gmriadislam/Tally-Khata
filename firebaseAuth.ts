import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider configured with Google Drive scope
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
// Prompt user to select account if needed
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory cache for OAuth access token (never persist in localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;

export function getStoredAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setStoredAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export async function loginWithGoogle(): Promise<{ user: User; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('গুগল একাউন্ট থেকে ড্রাইভ অ্যাক্সেস টোকেন পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }

    inMemoryAccessToken = accessToken;
    return {
      user: result.user,
      accessToken,
    };
  } catch (error: unknown) {
    console.error('Google Sign-In Error:', error);
    const msg = error instanceof Error ? error.message : 'লগইন করতে সমস্যা হয়েছে';
    throw new Error(msg);
  }
}

export async function logoutGoogle(): Promise<void> {
  try {
    await signOut(auth);
    inMemoryAccessToken = null;
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      inMemoryAccessToken = null;
    }
    callback(user);
  });
}
