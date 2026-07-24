import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchNotes, updateNote, deleteNote, reorderNotes } from "../services/api";
import type { Note } from "../services/api";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KeepInputBar } from "../components/KeepInputBar";
import { NoteCard, NoteCardSkeleton } from "../components/NoteCard";
import { NoteModal } from "../components/NoteModal";
import type { MainLayoutContextType } from "../layouts/MainLayout";

export const Dashboard: React.FC = () => {
  const context = useOutletContext<MainLayoutContextType | null>();
  const searchQuery = context?.searchQuery || "";
  const isGridView = context?.isGridView ?? true;
  const refreshTrigger = context?.refreshTrigger || 0;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const loadNotes = () => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać notatek. Upewnij się, że backend jest połączony.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const handleNoteContentChange = async (noteId: string, newContent: string) => {
    // Optimistic UI update
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
    );
    try {
      await updateNote(noteId, { content: newContent });
    } catch (e) {
      console.error("Failed to update note content:", e);
      loadNotes(); // rollback
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, is_pinned: newPinned } : n))
    );
    try {
      await updateNote(noteId, { is_pinned: newPinned });
    } catch (e) {
      console.error("Failed to toggle pin status:", e);
      loadNotes(); // rollback
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę notatkę?")) return;
    
    // Optimistic UI update
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    
    try {
      await deleteNote(noteId);
    } catch (e) {
      console.error("Failed to delete note:", e);
      loadNotes(); // rollback
      alert("Nie udało się usunąć notatki.");
    }
  };

  const handleUpdateTitle = async (noteId: string, newTitle: string) => {
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n)));
    try {
      await updateNote(noteId, { title: newTitle });
    } catch (e) {
      console.error("Failed to update title:", e);
      loadNotes();
    }
  };

  const handleUpdateLabel = async (noteId: string, newLabel: string) => {
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === noteId ? { ...n, note_type: newLabel } : n)));
    try {
      await updateNote(noteId, { note_type: newLabel });
    } catch (e) {
      console.error("Failed to update label:", e);
      loadNotes();
    }
  };

  const formatNoteDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Notes are already sorted by the backend (by order, then created_at)
  const sortedNotes = notes;

  // Quick notes: exclude strategic goals and AI-generated morning/evening plans/reflections
  const quickNotes = sortedNotes.filter((n) => {
    const isStrategic = n.note_type === "strategic";
    const isAiPlan = n.note_type === "daily_morning" && n.title === "Plan Poranny";
    const isAiReflection = n.note_type === "daily_evening" && n.title === "Refleksja Wieczorna";
    return !isStrategic && !isAiPlan && !isAiReflection;
  });

  // Apply search query filtering
  const filteredNotes = quickNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = n.title ? n.title.toLowerCase().includes(q) : false;
    const contentMatch = n.content.toLowerCase().includes(q);
    return titleMatch || contentMatch;
  });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

  // Zmieniono na CSS Grid wypełniający najpierw rzędy (od lewej do prawej),
  // items-start sprawia, że karty nie rozciągają się w pionie.
  const gridClass = isGridView
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 items-start"
    : "flex flex-col max-w-2xl mx-auto gap-4";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setNotes((prevNotes) => {
      const oldIndex = prevNotes.findIndex((n) => n.id === active.id);
      const newIndex = prevNotes.findIndex((n) => n.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevNotes;

      const newNotes = [...prevNotes];
      const [movedNote] = newNotes.splice(oldIndex, 1);
      newNotes.splice(newIndex, 0, movedNote);

      // Re-assign order based on new array indices
      const updates = newNotes.map((n, idx) => ({ id: n.id, order: idx }));
      
      // Update state optimistically
      const updatedNotesState = newNotes.map((n, idx) => ({ ...n, order: idx }));
      
      // Send API request in background
      reorderNotes(updates).catch((err) => {
        console.error("Failed to reorder notes on server:", err);
        loadNotes(); // Revert on failure
      });

      return updatedNotesState;
    });
  };

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8">
      {/* Keep input bar mounted at the top center */}
      <KeepInputBar onSuccess={loadNotes} />

      {loading ? (
        <div className={gridClass + " mt-8"}>
          {[...Array(6)].map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
          <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-12 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 shadow-sm mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-lg">
            {searchQuery ? "Brak notatek pasujących do wyszukiwania." : "Brak notatek. Wpisz coś powyżej, aby utworzyć szybką notatkę."}
          </p>
        </div>
      ) : (
        <section className="space-y-6 mt-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  PRZYPIĘTE
                </h3>
                <div className={gridClass}>
                  <SortableContext items={pinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        formatNoteDate={formatNoteDate}
                        handleNoteContentChange={handleNoteContentChange}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDeleteNote}
                        onUpdateTitle={handleUpdateTitle}
                        onUpdateLabel={handleUpdateLabel}
                        onClick={(id) => setSelectedNoteId(id)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Unpinned / Other Notes Section */}
            {otherNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 pt-2">
                    INNE
                  </h3>
                )}
                <div className={gridClass}>
                  <SortableContext items={otherNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
                    {otherNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        formatNoteDate={formatNoteDate}
                        handleNoteContentChange={handleNoteContentChange}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDeleteNote}
                        onUpdateTitle={handleUpdateTitle}
                        onUpdateLabel={handleUpdateLabel}
                        onClick={(id) => setSelectedNoteId(id)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}
          </DndContext>
        </section>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNoteId(null)}
          formatNoteDate={formatNoteDate}
          handleNoteContentChange={handleNoteContentChange}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteNote}
          onUpdateTitle={handleUpdateTitle}
          onUpdateLabel={handleUpdateLabel}
        />
      )}
    </main>
  );
};

