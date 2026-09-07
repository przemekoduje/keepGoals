import React, { useState } from "react";
import type { Goal, KeyResult, Project } from "../services/api";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit3,
  Trash2,
  Target,
  FolderKanban,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  projects?: Project[];
  onToggleComplete: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onUpdateKeyResult?: (goalId: string, updatedKeyResults: KeyResult[]) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  projects = [],
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateKeyResult,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [expandedKr, setExpandedKr] = useState(true);

  // Find assigned project
  const project = goal.project_id
    ? projects.find((p) => p.id === goal.project_id)
    : null;

  // Horizon details
  const getHorizonBadge = (h: string) => {
    switch (h) {
      case "long_term":
        return {
          label: "Roczny / Wizja",
          classes: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
          icon: <Award className="w-3.5 h-3.5 mr-1" />
        };
      case "quarterly":
        return {
          label: "Kwartalny",
          classes: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
          icon: <Target className="w-3.5 h-3.5 mr-1" />
        };
      case "monthly":
        return {
          label: "Miesięczny",
          classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
          icon: <Calendar className="w-3.5 h-3.5 mr-1" />
        };
      default:
        return {
          label: "Strategiczny",
          classes: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: <Target className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  const horizonInfo = getHorizonBadge(goal.horizon);

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (goal.is_completed) return 100;
    if (!goal.key_results || goal.key_results.length === 0) return 0;
    const totalPercent = goal.key_results.reduce((acc, kr) => {
      const target = kr.target_value > 0 ? kr.target_value : 1;
      const ratio = Math.min(1, Math.max(0, kr.current_value / target));
      return acc + ratio * 100;
    }, 0);
    return Math.round(totalPercent / goal.key_results.length);
  };

  const progressPercent = calculateOverallProgress();

  const handleStepKr = (index: number, delta: number) => {
    if (!onUpdateKeyResult || !goal.key_results) return;
    const updated = [...goal.key_results];
    const item = { ...updated[index] };
    const step = item.target_value > 50 ? 5 : 1;
    item.current_value = Math.max(0, Math.min(item.target_value, item.current_value + delta * step));
    updated[index] = item;
    onUpdateKeyResult(goal.id, updated);
  };

  return (
    <div
      className={`group relative flex flex-col rounded-3xl p-6 transition-all duration-300 border ${
        goal.is_completed
          ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-85 hover:opacity-100"
          : "bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Top row: Badges and Actions */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${horizonInfo.classes}`}
          >
            {horizonInfo.icon}
            {horizonInfo.label}
          </span>

          {project && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: `${project.color}15`,
                color: project.color,
                borderColor: `${project.color}35`,
              }}
            >
              <FolderKanban className="w-3 h-3 mr-1" />
              {project.name}
            </span>
          )}
        </div>

        {/* Options menu & complete button */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleComplete(goal)}
            title={goal.is_completed ? "Oznacz jako aktywny" : "Oznacz jako zrealizowany"}
            className={`p-1.5 rounded-full transition-colors ${
              goal.is_completed
                ? "text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                : "text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            }`}
          >
            {goal.is_completed ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950/60" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-36 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-xs font-medium">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(goal);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center space-x-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edytuj cel</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(goal.id);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center space-x-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Usuń cel</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Goal Title */}
      <h3
        className={`text-lg font-bold mb-2 tracking-tight ${
          goal.is_completed
            ? "line-through text-slate-500 dark:text-slate-400"
            : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {goal.title}
      </h3>

      {/* Goal Description */}
      {goal.description && (
        <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer content={goal.description} />
        </div>
      )}

      {/* Overall Progress Bar */}
      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-500 dark:text-slate-400">Postęp realizacji (OKR)</span>
          <span
            className={
              progressPercent >= 100
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-700 dark:text-slate-200"
            }
          >
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/70 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progressPercent >= 100
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-amber-400 to-amber-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Key Results collapsible list */}
        {goal.key_results && goal.key_results.length > 0 && (
          <div className="mt-4 border-t border-slate-100 dark:border-slate-700/60 pt-3">
            <button
              onClick={() => setExpandedKr(!expandedKr)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-1"
            >
              <span>Kluczowe rezultaty ({goal.key_results.length})</span>
              {expandedKr ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {expandedKr && (
              <div className="mt-2 space-y-2.5">
                {goal.key_results.map((kr, idx) => {
                  const percent = Math.round(
                    Math.min(100, Math.max(0, (kr.current_value / (kr.target_value || 1)) * 100))
                  );
                  return (
                    <div
                      key={kr.id || idx}
                      className="bg-slate-50/80 dark:bg-slate-900/40 rounded-xl p-2.5 border border-slate-100/80 dark:border-slate-800/40 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                          {kr.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {kr.current_value} / {kr.target_value} {kr.unit}
                        </span>
                      </div>

                      {/* Mini bar & interactive step buttons */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {onUpdateKeyResult && !goal.is_completed && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleStepKr(idx, -1)}
                              disabled={kr.current_value <= 0}
                              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors border border-slate-200 dark:border-slate-700"
                              title="Zmniejsz"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleStepKr(idx, 1)}
                              disabled={kr.current_value >= kr.target_value}
                              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors border border-slate-200 dark:border-slate-700"
                              title="Zwiększ"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
