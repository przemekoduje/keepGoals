import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, RotateCcw, Cloud, Check } from "lucide-react";
import { fetchAxisTiles, saveAxisTiles, type AxisTile } from "../services/api";
import { GoalAIChat } from "../components/GoalAIChat";

const DEFAULT_TILES: AxisTile[] = [
  { id: "tile-1", title: "Social media & TV", x: 15, y: 78 },
  { id: "tile-2", title: "Serial po pracy", x: 28, y: 42 },
  { id: "tile-3", title: "Bieżące e-maile", x: 50, y: 22 },
  { id: "tile-4", title: "Architektura", x: 75, y: 55 },
  { id: "tile-5", title: "Wdrożenie projektu", x: 88, y: 82 },
];

const STORAGE_KEY = "keepgoals_ultra_minimal_axis_v5";

export const Goals: React.FC = () => {
  // 1. Natychmiastowe wczytanie z pamięci lokalnej (0 ms opóźnienia)
  const [tiles, setTiles] = useState<AxisTile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback do DEFAULT_TILES
    }
    return DEFAULT_TILES;
  });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("saved");
  const isLoadedFromBackendRef = useRef(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // 2. Bezpieczny i trwały zapis do bazy danych w chmurze
  const syncToCloud = useCallback(async (tilesToSave: AxisTile[]) => {
    try {
      setSaveStatus("saving");
      await saveAxisTiles(tilesToSave);
      setSaveStatus("saved");
    } catch (err) {
      console.warn("Błąd zapisu do chmury (zapis zachowany w localStorage):", err);
      setSaveStatus("error");
    }
  }, []);

  // 3. Pobranie z chmury po zamontowaniu komponentu
  useEffect(() => {
    let isMounted = true;

    async function loadTiles() {
      try {
        const remoteTiles = await fetchAxisTiles();
        if (!isMounted) return;

        if (remoteTiles && remoteTiles.length > 0) {
          setTiles(remoteTiles);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteTiles));
          setSaveStatus("saved");
        } else {
          // Jeśli baza w chmurze jest pusta, zainicjalizuj ją bieżącymi kafelkami
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
  }, [syncToCloud]);

  // 4. Natychmiastowy zapis do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
  }, [tiles]);

  // Obsługa pozycji podczas przeciągania kafelka
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

      // Po zakończeniu upuszczenia kafelka, natychmiast synchronizujemy z chmurą
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
    // Normalizacja Y (14 do 84) na skalę powiększenia (0.8 do 1.45)
    const normalizedY = (y - 14) / (84 - 14);
    const scale = 0.8 + normalizedY * 0.65;

    // Kolorystyka pastelowa
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

    return {
      scale,
      colorClasses,
      pinColor,
      isDragging,
    };
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between px-4 sm:px-8 py-3 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Pasek kontrolny z minimalistycznym wskaźnikiem zapisu */}
      <div className="flex items-center justify-end space-x-3 w-full shrink-0 mb-1">
        {/* Dyskretny status zapisu */}
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

      {/* PRZESTRZEŃ OSI - PEŁNA SZEROKOŚĆ */}
      <div
        ref={canvasRef}
        className="relative flex-1 w-full touch-none min-h-[340px] my-1"
      >
        {/* POZIOMA LINIA OSI */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 h-2.5 rounded-full bg-gradient-to-r from-rose-300 via-slate-200 to-emerald-300 dark:from-rose-900/60 dark:via-slate-800 dark:to-emerald-900/60 shadow-inner">
          <div className="absolute -left-1 -bottom-6 text-[11px] font-semibold text-rose-500 pointer-events-none whitespace-nowrap">
            Brak realizacji
          </div>
          <div className="absolute -right-1 -bottom-6 text-[11px] font-semibold text-emerald-500 pointer-events-none whitespace-nowrap">
            Cel
          </div>
        </div>

        {/* KAFELKI NA PRZESTRZENI */}
        {tiles.map((tile) => {
          const isDragging = activeDragId === tile.id;
          const { scale, colorClasses, pinColor } = getTileMetrics(
            tile.x,
            tile.y,
            isDragging
          );

          return (
            <React.Fragment key={tile.id}>
              {/* Pionowa linia do osi */}
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

              {/* Kropka na osi */}
              <div
                style={{ left: `${tile.x}%`, bottom: "24px" }}
                className={`absolute -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 pointer-events-none transition-transform ${pinColor} ${
                  isDragging ? "scale-150" : ""
                }`}
              />

              {/* KAFELEK */}
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

      {/* SEKCJA CZATU AI POD LINIĄ POZIOMĄ */}
      <div className="w-full shrink-0 mt-3 pt-2">
        <GoalAIChat
          currentTiles={tiles}
          onAddTile={handleAddTileDirect}
        />
      </div>

      {/* MINIMALISTYCZNY MODAL DODAWANIA */}
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
    </div>
  );
};
