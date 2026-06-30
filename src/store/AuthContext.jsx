import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  reload
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // 1. Listen for auth state changes
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsVerified(firebaseUser?.emailVerified ?? false);
      setLoading(false);
    });

    // 2. Handle redirect login results (ideal for PWAs / Mobile browser scopes)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setIsVerified(result.user.emailVerified ?? false);
        }
      })
      .catch((e) => {
        console.error("Firebase Redirect Login Error:", e);
        setAuthError(formatError(e.code));
      });

    return unsub;
  }, []);

  const clearError = () => setAuthError(null);

  const formatError = (code) => {
    const map = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment.",
      "auth/popup-closed-by-user": "Google sign-in was cancelled.",
      "auth/unauthorized-domain": "Unauthorized Domain: Please add your Vercel URL to the 'Authorized domains' list in your Firebase Console (Authentication -> Settings).",
      "auth/operation-not-allowed": "Google Sign-In is disabled. Please enable Google provider in your Firebase Console (Authentication -> Sign-in method).",
      "auth/network-request-failed": "Network error. Check your connection."
    };
    return map[code] || `Authentication error (${code}). Please check your Firebase settings.`;
  };

  const loginWithEmail = async (email, password) => {
    clearError();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (e) {
      const msg = formatError(e.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    clearError();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await sendEmailVerification(result.user);
      return { success: true, user: result.user };
    } catch (e) {
      const msg = formatError(e.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async () => {
    clearError();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (e) {
      console.warn("Firebase Google popup blocked or failed. Trying redirect login fallback...", e);
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true };
      } catch (redirectErr) {
        console.error("Firebase Google redirect failed too:", redirectErr);
        const msg = formatError(redirectErr.code || e.code);
        setAuthError(msg);
        return { success: false, error: msg };
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsVerified(false);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // Reload the Firebase user and explicitly sync the isVerified boolean state.
  // onAuthStateChanged does NOT re-fire when emailVerified changes, so we
  // manually refresh here after the user clicks the verification link.
  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      const verified = auth.currentUser.emailVerified;
      setIsVerified(verified);
      return verified;
    }
    return false;
  };

  const resetPassword = async (email) => {
    clearError();
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e) {
      const msg = formatError(e.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      isVerified,
      clearError,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
      resendVerification,
      refreshUser,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
