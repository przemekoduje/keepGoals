import React, { useState, useEffect, useMemo } from "react";
import { Plus, Target, Filter, ChevronDown, ChevronUp, Award, Calendar, Archive } from "lucide-react";
import { GoalCard } from "../components/GoalCard";
import { GoalModal } from "../components/GoalModal";
import { GoalDiagram } from "../components/GoalDiagram";
import { 
  fetchGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  type Goal, 
  type Project, 
  fetchProjects,
  type GoalHorizon
} from "../services/api";

type HorizonFilter = GoalHorizon | "all";

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Filters and Archive
  const [horizonFilter, setHorizonFilter] = useState<HorizonFilter>("all");
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [gData, pData] = await Promise.all([
          fetchGoals(),
          fetchProjects()
        ]);
        setGoals(gData);
        setProjects(pData);
      } catch (err) {
        console.error("Błąd podczas pobierania celów", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveGoal = async (data: any) => {
    try {
      if (editingGoal) {
        const updated = await updateGoal(editingGoal.id, data);
        setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
        if (selectedGoal?.id === updated.id) setSelectedGoal(updated);
      } else {
        const created = await createGoal(data);
        setGoals(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingGoal(null);
    } catch (err) {
      console.error(err);
      alert("Wystąpił błąd podczas zapisywania celu.");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten cel?")) return;
    try {
      await deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      if (selectedGoal?.id === goalId) setSelectedGoal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (goal: Goal) => {
    try {
      const updated = await updateGoal(goal.id, { is_completed: !goal.is_completed });
      setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
      if (selectedGoal?.id === updated.id) setSelectedGoal(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.is_completed && (horizonFilter === "all" || g.horizon === horizonFilter));
  }, [goals, horizonFilter]);

  const completedGoals = useMemo(() => {
    return goals.filter(g => g.is_completed && (horizonFilter === "all" || g.horizon === horizonFilter));
  }, [goals, horizonFilter]);

  if (selectedGoal) {
    return (
      <GoalDiagram 
        goal={selectedGoal} 
        onBack={() => setSelectedGoal(null)} 
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            Cele strategiczne
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj swoimi celami i przejdź do diagramu, aby rozbić je na mniejsze kroki
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-400/20 transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nowy cel</span>
        </button>
      </div>

      {/* Filtry horyzontów */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center space-x-2 mr-2 text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Horyzont:</span>
        </div>
        
        <button
          onClick={() => setHorizonFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            horizonFilter === "all"
              ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50"
          }`}
        >
          Wszystkie
        </button>
        <button
          onClick={() => setHorizonFilter("long_term")}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            horizonFilter === "long_term"
              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60"
              : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Roczne</span>
        </button>
        <button
          onClick={() => setHorizonFilter("quarterly")}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            horizonFilter === "quarterly"
              ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60"
              : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Kwartalne</span>
        </button>
        <button
          onClick={() => setHorizonFilter("monthly")}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            horizonFilter === "monthly"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
              : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Miesięczne</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Ładowanie celów...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Brak celów</h3>
          <p className="text-slate-500 mt-1">Dodaj swój pierwszy cel strategiczny, aby rozpocząć planowanie.</p>
        </div>
      ) : (
        <>
          {activeGoals.length === 0 && horizonFilter !== "all" && (
            <div className="text-center py-8 text-slate-500">
              Brak aktywnych celów dla wybranego horyzontu.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {activeGoals.map(goal => (
              <div key={goal.id} className="flex flex-col gap-3 relative h-full">
                <GoalCard 
                  goal={goal} 
                  projects={projects}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(g) => { setEditingGoal(g); setIsModalOpen(true); }}
                  onDelete={handleDeleteGoal}
                  onClick={() => setSelectedGoal(goal)}
                  onUpdateKeyResult={async (id, krs) => {
                    try {
                      const updated = await updateGoal(id, { key_results: krs });
                      setGoals(prev => prev.map(g => g.id === id ? updated : g));
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Archiwum Sukcesów */}
          {completedGoals.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowArchive(!showArchive)}
                className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold text-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <Archive className="w-4 h-4" />
                </div>
                <span>Archiwum Sukcesów ({completedGoals.length})</span>
                {showArchive ? (
                  <ChevronUp className="w-5 h-5 opacity-60" />
                ) : (
                  <ChevronDown className="w-5 h-5 opacity-60" />
                )}
              </button>

              {showArchive && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
                  {completedGoals.map(goal => (
                    <div key={goal.id} className="flex flex-col gap-3 relative h-full">
                      <GoalCard 
                        goal={goal} 
                        projects={projects}
                        onToggleComplete={handleToggleComplete}
                        onEdit={(g) => { setEditingGoal(g); setIsModalOpen(true); }}
                        onDelete={handleDeleteGoal}
                        onClick={() => setSelectedGoal(goal)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <GoalModal
          goal={editingGoal}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGoal}
          projects={projects}
        />
      )}
    </div>
  );
};
