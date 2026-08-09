import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, Trash2, Layers, Check, X, AlertCircle } from "lucide-react";
import { fetchProjects, createProject, deleteProject } from "../services/api";
import type { Project } from "../services/api";

const PRESET_COLORS = [
  { name: "Black Forest", hex: "#143109" },
  { name: "Dry Sage", hex: "#AAAE7F" },
  { name: "Beige", hex: "#D0D6B3" },
  { name: "Bright Snow", hex: "#F7F7F7" },
  { name: "Platinum", hex: "#EFEFEF" },
];

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#143109");
  const [isCreating, setIsCreating] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Błąd pobierania listy projektów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsCreating(true);
      await createProject({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        status: "active",
      });
      setName("");
      setDescription("");
      setSelectedColor("#143109");
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert(err.message || "Nie udało się utworzyć projektu.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Czy na pewno chcesz usunąć projekt "${projectName}"? Notatki nie zostaną usunięte.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      loadProjects();
    } catch (err: any) {
      alert(err.message || "Błąd podczas usuwania projektu.");
    }
  };

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#AAAE7F]/30 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-7 h-7 text-[#143109] dark:text-[#AAAE7F]" />
            <h1 className="text-2xl font-extrabold text-[#143109] dark:text-[#F7F7F7]">Projekty</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Organizuj powiązane notatki, transkrypcje i zadania w dedykowanych obszarach projektowych.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nowy Projekt</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-[#EFEFEF] dark:bg-[#143109]/40 rounded-2xl p-5 border border-[#AAAE7F]/30 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-1">Błąd połączenia</p>
          <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#EFEFEF] dark:bg-[#202124] rounded-3xl p-12 border border-[#AAAE7F]/30 text-center text-slate-400 dark:text-slate-500 shadow-sm max-w-xl mx-auto my-12">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-70 text-[#143109] dark:text-[#AAAE7F]" />
          <h3 className="text-lg font-bold text-[#143109] dark:text-[#F7F7F7] mb-1">Brak aktywnych projektów</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            Utwórz swój pierwszy projekt, aby pogrupować notatki i ustalenia w jednym miejscu.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Utwórz Projekt</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ borderTopColor: project.color || "#143109" }}
              className="group relative bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl border border-slate-200/80 dark:border-slate-800 border-t-4 p-5 hover:shadow-xl hover:border-[#AAAE7F] transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-[#143109] dark:text-white leading-snug line-clamp-1 group-hover:text-[#AAAE7F] transition-colors">
                    {project.name}
                  </h3>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-all cursor-pointer flex-shrink-0"
                    title="Usuń projekt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{project.notes_count || 0} notatek</span>
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D0D6B3] text-[#143109] border border-[#AAAE7F]/40">
                  Aktywny
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Nowy Projekt */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#202124] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-[#143109] dark:text-[#AAAE7F]" />
                <h3 className="text-lg font-bold text-[#143109] dark:text-white">Nowy Projekt</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nazwa projektu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Nowa Kolekcja Jesienna 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AAAE7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Opis (opcjonalny)
                </label>
                <textarea
                  rows={3}
                  placeholder="Krótki opis celów i zakresu projektu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AAAE7F] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Kolor akcentu
                </label>
                <div className="flex items-center space-x-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer border border-slate-300 dark:border-slate-600 ${
                        selectedColor === c.hex ? "ring-2 ring-offset-2 ring-[#143109] scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      title={c.name}
                    >
                      {selectedColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-[#143109] hover:bg-[#143109]/90 disabled:opacity-50 text-[#F7F7F7] font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {isCreating ? "Tworzenie..." : "Stwórz projekt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
