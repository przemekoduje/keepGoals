import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, RotateCcw, Cloud, Check, ArrowLeft } from "lucide-react";
import { fetchAxisTiles, saveAxisTiles, fetchAiTileSuggestions, type AxisTile, type Goal } from "../services/api";
import { GoalAIChat } from "./GoalAIChat";

const DEFAULT_TILES: AxisTile[] = [
  { id: "tile-1", title: "Social media & TV", x: 15, y: 78 },
  { id: "tile-2", title: "Serial po pracy", x: 28, y: 42 },
  { id: "tile-3", title: "Bieżące e-maile", x: 50, y: 22 },
  { id: "tile-4", title: "Architektura", x: 75, y: 55 },
  { id: "tile-5", title: "Wdrożenie projektu", x: 88, y: 82 },
];

interface GoalDiagramProps {
  goal: Goal;
  onBack: () => void;
}

export const GoalDiagram: React.FC<GoalDiagramProps> = ({ goal, onBack }) => {
  const STORAGE_KEY = `keepgoals_ultra_minimal_axis_v5_${goal.id}`;

  const [tiles, setTiles] = useState<AxisTile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TILES;
  });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("saved");
  const isLoadedFromBackendRef = useRef(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSuggestionsPanelOpen, setIsSuggestionsPanelOpen] = useState(false);

  const syncToCloud = useCallback(async (tilesToSave: AxisTile[]) => {
    try {
      setSaveStatus("saving");
      await saveAxisTiles(goal.id, tilesToSave);
      setSaveStatus("saved");
    } catch (err) {
      console.warn("Błąd zapisu do chmury (zapis zachowany w localStorage):", err);
      setSaveStatus("error");
    }
  }, [goal.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadTiles() {
      try {
        const remoteTiles = await fetchAxisTiles(goal.id);
        if (!isMounted) return;

        if (remoteTiles && remoteTiles.length > 0) {
          setTiles(remoteTiles);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteTiles));
          setSaveStatus("saved");
        } else {
          syncToCloud(tiles);
        }
      } catch (err) {
        console.warn("Nie udało się pobrać kafelków z chmury, używam localStorage:", err);
      } finally {
        if (isMounted) {
          isLoadedFromBackendRef.current = true;
        }
      }
    }

    loadTiles();

    return () => {
      isMounted = false;
    };
  }, [goal.id, syncToCloud, STORAGE_KEY]); // removed `tiles` from dependency to avoid loop

  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      try {
        setIsSuggestionsLoading(true);
        const res = await fetchAiTileSuggestions(goal.id);
        if (!isMounted) return;
        
        if (res.suggestions && res.suggestions.length > 0) {
          // Filtrujemy sugestie, które są już na planszy (opcjonalnie)
          setSuggestions(res.suggestions);
          setIsSuggestionsPanelOpen(true);
        }
      } catch (err) {
        console.warn("Nie udało się pobrać sugestii AI:", err);
      } finally {
        if (isMounted) setIsSuggestionsLoading(false);
      }
    }
    // Pobieramy sugestie tylko przy wejściu (jeśli jest to nowa sesja analizy)
    loadSuggestions();

    return () => {
      isMounted = false;
    };
  }, [goal.id]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
  }, [tiles, STORAGE_KEY]);

  const updateTilePosition = useCallback(
    (tileId: string, clientX: number, clientY: number) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      const relX = clientX - rect.left;
      const clampedX = Math.max(8, Math.min(92, (relX / rect.width) * 100));

      const relY = rect.bottom - clientY;
      const clampedY = Math.max(14, Math.min(84, (relY / rect.height) * 100));

      setTiles((prev) =>
        prev.map((t) =>
          t.id === tileId
            ? {
                ...t,
                x: Math.round(clampedX * 10) / 10,
                y: Math.round(clampedY * 10) / 10,
              }
            : t
        )
      );
    },
    []
  );

  const handlePointerDown = (tileId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragId(tileId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragId) return;
    updateTilePosition(activeDragId, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveDragId(null);
      syncToCloud(tiles);
    }
  };

  const handleAddTile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTile: AxisTile = {
      id: `tile-${Date.now()}`,
      title: newTitle.trim(),
      x: 50,
      y: 50,
    };

    const updated = [...tiles, newTile];
    setTiles(updated);
    setNewTitle("");
    setIsModalOpen(false);
    syncToCloud(updated);
  };

  const handleAddTileDirect = useCallback((title: string, x: number, y: number) => {
    const newTile: AxisTile = {
      id: `tile-${Date.now()}`,
      title: title.trim(),
      x: Math.max(8, Math.min(92, Math.round(x * 10) / 10)),
      y: Math.max(14, Math.min(84, Math.round(y * 10) / 10)),
    };
    setTiles((prev) => {
      const updated = [...prev, newTile];
      syncToCloud(updated);
      return updated;
    });
  }, [syncToCloud]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const title = e.dataTransfer.getData("application/vnd.keepgoals.tile");
    if (!title || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const clampedX = Math.max(8, Math.min(92, (relX / rect.width) * 100));

    const relY = rect.bottom - e.clientY;
    const clampedY = Math.max(14, Math.min(84, (relY / rect.height) * 100));

    handleAddTileDirect(title, clampedX, clampedY);
    setSuggestions((prev) => prev.filter((s) => s !== title));
  };

  const handleDeleteTile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tiles.filter((t) => t.id !== id);
    setTiles(updated);
    syncToCloud(updated);
  };

  const handleReset = () => {
    setTiles(DEFAULT_TILES);
    syncToCloud(DEFAULT_TILES);
  };

  const getTileMetrics = (x: number, y: number, isDragging: boolean) => {
    const normalizedY = (y - 14) / (84 - 14);
    const scale = 0.8 + normalizedY * 0.65;

    let colorClasses =
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100";
    let pinColor = "bg-slate-400";

    if (x < 40) {
      colorClasses =
        "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200";
      pinColor = "bg-rose-400";
    } else if (x > 60) {
      colorClasses =
        "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200";
      pinColor = "bg-emerald-400";
    }

    return { scale, colorClasses, pinColor, isDragging };
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between px-4 sm:px-8 py-3 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="flex items-center justify-between w-full shrink-0 mb-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Powrót do listy celów"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Powrót</span>
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {goal.title}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <div
            onClick={() => syncToCloud(tiles)}
            title="Kliknij, aby wymusić synchronizację w chmurze"
            className="cursor-pointer flex items-center space-x-1 px-2 py-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {saveStatus === "saving" ? (
              <>
                <Cloud className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                <span className="text-[11px] font-medium text-amber-500">Zapisywanie...</span>
              </>
            ) : saveStatus === "error" ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] font-medium text-rose-400">Zapisano lokalnie</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Zapisano</span>
              </>
            )}
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Przywróć domyślne"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold text-xs shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dodaj</span>
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="relative flex-1 w-full touch-none min-h-[340px] my-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 h-2.5 rounded-full bg-gradient-to-r from-rose-300 via-slate-200 to-emerald-300 dark:from-rose-900/60 dark:via-slate-800 dark:to-emerald-900/60 shadow-inner">
          <div className="absolute -left-1 -bottom-6 text-[11px] font-semibold text-rose-500 pointer-events-none whitespace-nowrap">
            Brak realizacji
          </div>
          <div className="absolute -right-1 -bottom-6 text-[11px] font-semibold text-emerald-500 pointer-events-none whitespace-nowrap">
            Cel
          </div>
        </div>

        {tiles.map((tile) => {
          const isDragging = activeDragId === tile.id;
          const { scale, colorClasses, pinColor } = getTileMetrics(
            tile.x,
            tile.y,
            isDragging
          );

          return (
            <React.Fragment key={tile.id}>
              <div
                style={{
                  left: `${tile.x}%`,
                  bottom: "24px",
                  height: `calc(${tile.y}% - 14px)`,
                }}
                className={`absolute w-px border-l border-dashed pointer-events-none transition-all duration-75 ${
                  isDragging
                    ? "border-amber-400 opacity-80"
                    : "border-slate-300 dark:border-slate-700 opacity-40"
                }`}
              />
              <div
                style={{ left: `${tile.x}%`, bottom: "24px" }}
                className={`absolute -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 pointer-events-none transition-transform ${pinColor} ${
                  isDragging ? "scale-150" : ""
                }`}
              />
              <div
                style={{
                  left: `${tile.x}%`,
                  bottom: `${tile.y}%`,
                  transform: `translate(-50%, 50%) scale(${scale})`,
                  transformOrigin: "center center",
                }}
                onPointerDown={(e) => handlePointerDown(tile.id, e)}
                className={`absolute select-none cursor-grab touch-none rounded-2xl border transition-shadow duration-150 ${colorClasses} ${
                  isDragging
                    ? "cursor-grabbing shadow-2xl ring-2 ring-amber-400 z-40"
                    : "shadow-sm hover:shadow-md z-20"
                } px-3.5 py-2.5 min-w-[120px] max-w-[200px] flex items-center justify-between gap-2`}
              >
                <span className="font-semibold text-xs leading-snug truncate">
                  {tile.title}
                </span>
                <button
                  onClick={(e) => handleDeleteTile(tile.id, e)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                  title="Usuń"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="w-full shrink-0 mt-3 pt-2">
        <GoalAIChat
          currentTiles={tiles}
          onAddTile={handleAddTileDirect}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                Nowy kafelek
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handleAddTile} className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nazwa..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Panel boczny z sugestiami AI */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-500 z-40 flex flex-col ${isSuggestionsPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 mt-12 sm:mt-0">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-amber-500">✨</span> Sugestie AI
          </h3>
          <button 
            onClick={() => setIsSuggestionsPanelOpen(false)} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {isSuggestionsLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-6 text-amber-500/70">
              <Cloud className="w-6 h-6 animate-pulse" />
              <div className="text-xs font-medium text-center animate-pulse">Analizowanie celu...</div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-6 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
              Brak nowych sugestii.<br/><span className="text-[10px] opacity-70">Wszystko dodane lub cel jest pusty.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 px-1">Przeciągnij kafelek na planszę:</p>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={`${suggestion}-${idx}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/vnd.keepgoals.tile", suggestion);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="group relative p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all shadow-sm overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 pl-1">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
