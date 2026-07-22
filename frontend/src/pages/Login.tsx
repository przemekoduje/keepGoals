import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isDemoMode } from "../config/firebase";

export const Login: React.FC = () => {
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      if (err?.code === 'auth/configuration-not-found') {
        setError("Usługa Firebase Authentication nie jest jeszcze włączona. Aktywuj ją w konsoli Firebase (Build -> Authentication -> Rozpocznij).");
      } else {
        setError(`Logowanie przez ${providerName} nie powiodło się. Wypróbuj e-mail lub zaloguj się ponownie.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Podaj adres e-mail oraz hasło.");
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setError("Hasło powinno składać się z co najmniej 6 znaków.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Hasła nie są identyczne.");
        return;
      }
    }
    
    setIsLoading(true);
    try {
      if (isRegistering) {
        await signUpWithEmail(email, password, displayName.trim() || undefined);
      } else {
        await loginWithEmail(email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      const code = err.code || "";
      if (code === 'auth/configuration-not-found') {
        setError("Usługa Firebase Authentication nie jest włączona w Twoim projekcie Firebase. Wejdź na console.firebase.google.com -> sekcja 'Authentication' -> kliknij 'Rozpocznij' i włącz metodę Email/Hasło.");
      } else if (code === 'auth/weak-password') {
        setError("Hasło jest zbyt słabe (wymagane minimum 6 znaków).");
      } else if (code === 'auth/invalid-email') {
        setError("Niepoprawny format adresu e-mail.");
      } else if (code === 'auth/email-already-in-use') {
        setError("Konto z tym adresem e-mail już istnieje. Przełącz na zakładkę 'Zaloguj się'.");
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError("Nieprawidłowy adres e-mail lub hasło.");
      } else {
        setError(err.message || "Wystąpił błąd autoryzacji. Spróbuj ponownie.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm p-6 sm:p-8 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
        
        <div className="h-14 w-14 bg-pastel-blue-light text-pastel-blue-dark rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          keepGoals
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
          Aplikacja do zarządzania celami i notatkami z AI
        </p>

        {/* Tab Selection */}
        <div className="flex w-full bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isRegistering
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Zaloguj się
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isRegistering
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Załóż konto
          </button>
        </div>

        {/* Formularz Email/Hasło */}
        <form onSubmit={handleSubmit} className="w-full mb-6">
          <div className="space-y-3 text-left">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Twoje Imię</label>
                <input
                  type="text"
                  placeholder="np. Jan Kowalski"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Adres E-mail</label>
              <input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Hasło</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">Powtórz Hasło</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pastel-blue-dark transition-all"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-5 bg-pastel-blue-dark hover:bg-blue-600 active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? "Przetwarzanie..." : isRegistering ? "Zarejestruj się" : "Zaloguj się"}
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
            type="button"
            onClick={() => handleSocialLogin("Google", loginWithGoogle)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors duration-200 flex items-center justify-center space-x-3 cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Zaloguj przez Google</span>
          </button>
        </div>

        {error && (
          <div className="text-xs text-rose-600 dark:text-rose-400 mt-5 font-medium bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 py-2.5 px-4 rounded-xl w-full text-left">
            ⚠️ {error}
          </div>
        )}

        {isDemoMode && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-left">
            <span className="font-bold">Tryb podglądu (Demo):</span> Wpisz dowolny e-mail i hasło lub wybierz Google. Aby aktywować produktywne Firebase Auth na żywo, uzupełnij klucze w `frontend/.env`.
          </div>
        )}
      </div>
    </div>
  );
};
