import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          {/* Prosty spinner CSS */}
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-300"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
            Ładowanie profilu...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
