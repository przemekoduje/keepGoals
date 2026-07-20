import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState<string>("Łączenie z API...");
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Błąd HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setStatus(data.status || JSON.stringify(data));
        setIsError(false);
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
        setStatus("Błąd połączenia (CORS / Network)");
      });
  }, []);

  return (
    <div className="min-h-screen bg-pastel-bg-light dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm p-8 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-pastel-blue-light text-pastel-blue-dark rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          keepGoals
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
          Inicjalizacja tablicy celów i notatek
        </p>
        
        {/* Wizualizator CORS (Badge) */}
        <div 
          className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm inline-flex items-center space-x-2 ${
            isError 
              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" 
              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${isError ? "bg-rose-500" : "bg-emerald-500"}`} />
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
