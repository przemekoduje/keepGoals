import React, { useState, useEffect } from 'react';
import { fetchUserSettings, updateUserSettings } from '../services/api';

export const Settings: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await fetchUserSettings();
      setRetentionDays(settings.trash_retention_days);
    } catch (error) {
      console.error('Failed to load settings', error);
      setMessage('Błąd wczytywania ustawień.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateUserSettings({ trash_retention_days: retentionDays });
      setMessage('Ustawienia zapisane pomyślnie.');
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage('Błąd zapisywania ustawień.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center space-x-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-800 dark:text-slate-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Ustawienia
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
            Opcje kosza (Trash)
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Zdecyduj, po jakim czasie notatki usunięte do kosza będą trwale usuwane (bez możliwości przywrócenia).
            </p>

            <div className="flex flex-col space-y-3 mt-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="retention"
                  value={7}
                  checked={retentionDays === 7}
                  onChange={() => setRetentionDays(7)}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 dark:focus:ring-white dark:border-slate-600 dark:checked:bg-white"
                />
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Po 7 dniach
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="retention"
                  value={30}
                  checked={retentionDays === 30}
                  onChange={() => setRetentionDays(30)}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 dark:focus:ring-white dark:border-slate-600 dark:checked:bg-white"
                />
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Po 30 dniach (domyślnie)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="retention"
                  value={0}
                  checked={retentionDays === 0}
                  onChange={() => setRetentionDays(0)}
                  className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 dark:focus:ring-white dark:border-slate-600 dark:checked:bg-white"
                />
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Nigdy (wymaga ręcznego czyszczenia kosza)
                </span>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className={`text-sm ${message.includes('Błąd') ? 'text-rose-500' : 'text-emerald-500'}`}>
              {message}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
