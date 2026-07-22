import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../config/firebase";

export const Login: React.FC = () => {
  const { user, loginWithGoogle, loginWithFacebook, loginWithTwitter, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSocialLogin = async (providerName: string, loginFn: () => Promise<void>) => {
    try {
      setError(null);
      await loginFn();
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(`Logowanie przez ${providerName} nie powiodło się.`);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Wpisz e-mail i hasło.");
      return;
    }
    
    setIsEmailLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/weak-password') {
        setError("Hasło jest zbyt słabe (minimum 6 znaków).");
      } else if (err.code === 'auth/invalid-email') {
        setError("Niepoprawny format adresu e-mail.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Ten e-mail jest już zajęty przez inne konto.");
      } else {
        setError("Logowanie / rejestracja nie powiodły się. Sprawdź dane.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm p-6 sm:p-8 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
        
        <div className="h-16 w-16 bg-pastel-blue-light text-pastel-blue-dark rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          keepGoals
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Zaloguj się, aby zarządzać swoimi celami i notatkami
        </p>

        {/* Formularz Email/Hasło */}
        <form onSubmit={handleEmailLogin} className="w-full mb-6">
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
              required
            />
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isEmailLoading}
            className="w-full mt-4 bg-pastel-blue-dark hover:bg-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center"
          >
            {isEmailLoading ? "Przetwarzanie..." : "Zaloguj z E-mail"}
          </button>
        </form>

        <div className="w-full flex items-center mb-6">
          <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
          <span className="px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">LUB</span>
          <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700"></div>
        </div>

        {/* Przyciski Social */}
        <div className="w-full space-y-3">
          <button
            onClick={() => handleSocialLogin("Google", loginWithGoogle)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin("Facebook", loginWithFacebook)}
            className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>

          <button
            onClick={() => handleSocialLogin("X", loginWithTwitter)}
            className="w-full bg-black hover:bg-slate-800 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
            </svg>
            <span>X (Twitter)</span>
          </button>
        </div>

        {error && (
          <p className="text-sm text-rose-500 mt-5 font-medium bg-rose-50 dark:bg-rose-950/30 py-2 px-4 rounded-lg w-full">
            {error}
          </p>
        )}

        {isDemoMode && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-left">
            <span className="font-bold">Tryb demonstracyjny:</span> Zaloguj się dowolną metodą. Zostaniesz wpuszczony jako użytkownik demo.
          </div>
        )}
      </div>
    </div>
  );
};
