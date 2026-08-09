import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchNotes, fetchProjects, updateNote, deleteNote, reorderNotes, reanalyzeNote } from "../services/api";
import type { Note, Project } from "../services/api";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KeepInputBar } from "../components/KeepInputBar";
import { NoteCard, NoteCardSkeleton } from "../components/NoteCard";
import { NoteModal } from "../components/NoteModal";
import type { MainLayoutContextType } from "../layouts/MainLayout";
import { useUserProfiles } from "../contexts/UserProfilesContext";


const breakpointColumnsObj = {
  default: 6,
  1536: 5, // 2xl
  1280: 4, // xl
  1024: 3, // lg
  768: 2,  // md
  640: 1   // sm
};

export const Dashboard: React.FC = () => {
  const context = useOutletContext<MainLayoutContextType | null>();
  const { fetchProfiles } = useUserProfiles();
  const searchQuery = context?.searchQuery || "";
  const isGridView = context?.isGridView ?? true;
  const refreshTrigger = context?.refreshTrigger || 0;

  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  const loadNotes = () => {
    setLoading(true);
    fetchProjects().then(setProjects).catch(console.error);
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

  useEffect(() => {
    const uids = new Set<string>();
    notes.forEach((note) => {
      if (note.user_id) uids.add(note.user_id);
      note.assigned_user_ids?.forEach((uid) => uids.add(uid));
      note.pending_user_ids?.forEach((uid) => uids.add(uid));
    });
    fetchProfiles(Array.from(uids));
  }, [notes, fetchProfiles]);

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

  const handleUpdateProject = async (noteId: string, projectId: string | null) => {
    const pids = projectId ? [projectId] : [];
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, project_ids: pids, project_id: projectId || undefined } : n))
    );
    try {
      await updateNote(noteId, { project_id: projectId, project_ids: pids });
      fetchProjects().then(setProjects).catch(console.error);
    } catch (e) {
      console.error("Failed to update note project:", e);
      loadNotes();
    }
  };

  const handleUpdateProjects = async (noteId: string, projectIds: string[]) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, project_ids: projectIds, project_id: projectIds[0] || undefined } : n))
    );
    try {
      await updateNote(noteId, { project_ids: projectIds, project_id: projectIds[0] || null });
      fetchProjects().then(setProjects).catch(console.error);
    } catch (e) {
      console.error("Failed to update note projects:", e);
      loadNotes();
    }
  };

  const handleReanalyzeNote = async (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, processing_status: "pending" } : n))
    );
    try {
      await reanalyzeNote(noteId);
      setTimeout(() => loadNotes(), 2500);
    } catch (e) {
      console.error("Failed to reanalyze note:", e);
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

  const listClass = "flex flex-col max-w-2xl mx-auto gap-4";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
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
        isGridView ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4 mt-8">
            {[...Array(6)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={listClass + " mt-8"}>
            {[...Array(6)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
          <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-[#EFEFEF] dark:bg-slate-800 rounded-[24px] p-12 border border-[#AAAE7F]/30 text-center text-[#143109]/70 shadow-sm mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-lg font-semibold text-[#143109]">
            {searchQuery ? "Brak notatek pasujących do wyszukiwania." : "Brak notatek. Wpisz coś powyżej, aby utworzyć szybką notatkę."}
          </p>
        </div>
      ) : (
        <section className="space-y-6 mt-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#143109]/70 dark:text-slate-400 px-1">
                  PRZYPIĘTE
                </h3>
                <SortableContext items={pinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
                  {isGridView ? (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 w-full space-y-4">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          projects={projects}
                          formatNoteDate={formatNoteDate}
                          handleNoteContentChange={handleNoteContentChange}
                          onTogglePin={handleTogglePin}
                          onDelete={handleDeleteNote}
                          onUpdateTitle={handleUpdateTitle}
                          onUpdateLabel={handleUpdateLabel}
                          onUpdateProject={handleUpdateProject}
                          onUpdateProjects={handleUpdateProjects}
                          onReanalyze={handleReanalyzeNote}
                          onClick={(id) => setSelectedNoteId(id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={listClass}>
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          projects={projects}
                          formatNoteDate={formatNoteDate}
                          handleNoteContentChange={handleNoteContentChange}
                          onTogglePin={handleTogglePin}
                          onDelete={handleDeleteNote}
                          onUpdateTitle={handleUpdateTitle}
                          onUpdateLabel={handleUpdateLabel}
                          onUpdateProject={handleUpdateProject}
                          onUpdateProjects={handleUpdateProjects}
                          onReanalyze={handleReanalyzeNote}
                          onClick={(id) => setSelectedNoteId(id)}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
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
                <SortableContext items={otherNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
                  {isGridView ? (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:grid-cols-6 gap-4 w-full space-y-4">
                      {otherNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          projects={projects}
                          formatNoteDate={formatNoteDate}
                          handleNoteContentChange={handleNoteContentChange}
                          onTogglePin={handleTogglePin}
                          onDelete={handleDeleteNote}
                          onUpdateTitle={handleUpdateTitle}
                          onUpdateLabel={handleUpdateLabel}
                          onUpdateProject={handleUpdateProject}
                          onUpdateProjects={handleUpdateProjects}
                          onReanalyze={handleReanalyzeNote}
                          onClick={(id) => setSelectedNoteId(id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={listClass}>
                      {otherNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          projects={projects}
                          formatNoteDate={formatNoteDate}
                          handleNoteContentChange={handleNoteContentChange}
                          onTogglePin={handleTogglePin}
                          onDelete={handleDeleteNote}
                          onUpdateTitle={handleUpdateTitle}
                          onUpdateLabel={handleUpdateLabel}
                          onUpdateProject={handleUpdateProject}
                          onUpdateProjects={handleUpdateProjects}
                          onReanalyze={handleReanalyzeNote}
                          onClick={(id) => setSelectedNoteId(id)}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </div>
            )}

            <DragOverlay adjustScale={true}>
              {activeId ? (
                (() => {
                  const activeNote = notes.find((n) => n.id === activeId);
                  if (!activeNote) return null;
                  return (
                    <div className="w-[320px] md:w-[360px] opacity-90 rotate-1 scale-105 pointer-events-none shadow-2xl">
                      <NoteCard
                        note={activeNote}
                        projects={projects}
                        formatNoteDate={formatNoteDate}
                        handleNoteContentChange={handleNoteContentChange}
                      />
                    </div>
                  );
                })()
              ) : null}
            </DragOverlay>
          </DndContext>
        </section>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          projects={projects}
          onClose={() => setSelectedNoteId(null)}
          formatNoteDate={formatNoteDate}
          handleNoteContentChange={handleNoteContentChange}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteNote}
          onUpdateTitle={handleUpdateTitle}
          onUpdateLabel={handleUpdateLabel}
          onUpdateProject={handleUpdateProject}
          onUpdateProjects={handleUpdateProjects}
          onReanalyze={handleReanalyzeNote}
        />
      )}
    </main>
  );
};
