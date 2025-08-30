'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const getErrorMessage = (error: any): string => {
    if (error && error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already in use.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-credential':
                 return 'Invalid email or password.';
            case 'auth/popup-closed-by-user':
                return 'Authentication process was cancelled.';
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with this email address using a different sign-in method.';
            default:
                return error.message || 'An unknown authentication error occurred.';
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred.';
};

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
        });
    }
};

export async function signup(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });
    await createUserDocument(user);

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function logout() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}

export async function handleOAuthUser(user: User) {
    try {
        await createUserDocument(user);
        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}
