import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, isDemoMode, setDemoCurrentUser } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
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

  const loginWithGoogle = async () => {
    if (isDemoMode) {
      const mockUser = {
        uid: "mock-user-123",
        email: "demo-user@keepgoals.com",
        displayName: "Użytkownik Demo",
        getIdToken: async () => "mock-jwt-token-123",
      } as unknown as User;
      localStorage.setItem("mock_user_session", JSON.stringify(mockUser));
      setUser(mockUser);
      setDemoCurrentUser(mockUser);
      return;
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
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
