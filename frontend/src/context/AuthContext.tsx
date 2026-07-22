import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, isDemoMode, setDemoCurrentUser } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isDemoMode) {
      const mockUserSession = localStorage.getItem("mock_user_session");
      if (mockUserSession) {
        const parsed = JSON.parse(mockUserSession);
        // recreate getIdToken method
        parsed.getIdToken = async () => "mock-jwt-token-123";
        setUser(parsed);
        setDemoCurrentUser(parsed);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDemoLogin = (providerName: string, emailStr?: string) => {
    const mockUser = {
      uid: `mock-user-${Date.now()}`,
      email: emailStr || `demo-${providerName.toLowerCase()}@keepgoals.com`,
      displayName: `Użytkownik Demo (${providerName})`,
      getIdToken: async () => "mock-jwt-token-123",
    } as unknown as User;
    localStorage.setItem("mock_user_session", JSON.stringify(mockUser));
    setUser(mockUser);
    setDemoCurrentUser(mockUser);
  };

  const loginWithGoogle = async () => {
    if (isDemoMode) return handleDemoLogin("Google");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithFacebook = async () => {
    if (isDemoMode) return handleDemoLogin("Facebook");
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithTwitter = async () => {
    if (isDemoMode) return handleDemoLogin("Twitter");
    const provider = new TwitterAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isDemoMode) return handleDemoLogin("Email", email);
    
    try {
      // Próba logowania
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      // Jeśli użytkownik nie istnieje, próbujemy go zarejestrować
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        try {
          await createUserWithEmailAndPassword(auth, email, pass);
        } catch (regError: any) {
          throw regError;
        }
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem("mock_user_session");
      setUser(null);
      setDemoCurrentUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithFacebook, loginWithTwitter, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
