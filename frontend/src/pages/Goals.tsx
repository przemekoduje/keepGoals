import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, RotateCcw } from "lucide-react";

export interface InteractiveTile {
  id: string;
  title: string;
  x: number; // 5 do 95 (% szerokości)
  y: number; // 12 do 88 (% wysokości od dołu)
}

const DEFAULT_TILES: InteractiveTile[] = [
  { id: "tile-1", title: "Social media & TV", x: 15, y: 78 },
  { id: "tile-2", title: "Serial po pracy", x: 28, y: 42 },
  { id: "tile-3", title: "Bieżące e-maile", x: 50, y: 22 },
  { id: "tile-4", title: "Architektura", x: 75, y: 55 },
  { id: "tile-5", title: "Wdrożenie projektu", x: 88, y: 82 },
];

const STORAGE_KEY = "keepgoals_ultra_minimal_axis_v4";

export const Goals: React.FC = () => {
  const [tiles, setTiles] = useState<InteractiveTile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_TILES;
  });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
  }, [tiles]);

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
    }
  };

  const handleAddTile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTile: InteractiveTile = {
      id: `tile-${Date.now()}`,
      title: newTitle.trim(),
      x: 50,
      y: 50,
    };

    setTiles([...tiles, newTile]);
    setNewTitle("");
    setIsModalOpen(false);
  };

  const handleDeleteTile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTiles((prev) => prev.filter((t) => t.id !== id));
  };

  const handleReset = () => {
    setTiles(DEFAULT_TILES);
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
      className="w-full h-[calc(100vh-4rem)] flex flex-col justify-between px-6 sm:px-10 py-4 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Pasek kontrolny */}
      <div className="flex items-center justify-end space-x-2 w-full">
        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset"
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
        className="relative flex-1 w-full touch-none my-2"
      >
        {/* POZIOMA LINIA OSI */}
        <div className="absolute bottom-12 left-4 right-4 sm:left-8 sm:right-8 h-2.5 rounded-full bg-gradient-to-r from-rose-300 via-slate-200 to-emerald-300 dark:from-rose-900/60 dark:via-slate-800 dark:to-emerald-900/60 shadow-inner">
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
                  bottom: "48px",
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
                style={{ left: `${tile.x}%`, bottom: "48px" }}
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

      <div className="h-4" />

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
