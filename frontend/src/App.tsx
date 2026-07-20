import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm p-8 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-2">Witaj w keepGoals!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Zalogowano jako: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email}</span>
        </p>
        <button
          onClick={logout}
          className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors duration-200"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
