import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderKanban, Layers, AlertCircle, CalendarDays } from "lucide-react";
import { fetchProjectDetails, fetchProjects, updateNote, deleteNote, reanalyzeNote } from "../services/api";
import type { Project, Note } from "../services/api";
import { KeepInputBar } from "../components/KeepInputBar";
import { NoteCard } from "../components/NoteCard";
import { NoteModal } from "../components/NoteModal";
import { ProjectTimelineDrawer } from "../components/ProjectTimelineDrawer";
import Masonry from "react-masonry-css";

const breakpointColumnsObj = {
  default: 6,
  1536: 5, // 2xl
  1280: 4, // xl
  1024: 3, // lg
  768: 2,  // md
  640: 1   // sm
};

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Selected note for detail modal
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      fetchProjects().then(setAllProjects).catch(console.error);
      const data = await fetchProjectDetails(id);
      setProject(data);
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || "Błąd pobierania danych projektu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleReanalyzeNote = async (noteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, processing_status: "pending" } : n))
    );
    try {
      await reanalyzeNote(noteId);
      setTimeout(() => loadProjectData(), 2500);
    } catch (e) {
      console.error("Failed to reanalyze note:", e);
      loadProjectData();
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

  const handleNoteContentChange = async (noteId: string, newContent: string) => {
    try {
      await updateNote(noteId, { content: newContent });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
      );
    } catch (e) {
      console.error("Failed to update note content:", e);
      loadProjectData();
    }
  };

  const handleTogglePin = async (noteId: string, currentPinStatus: boolean) => {
    try {
      await updateNote(noteId, { is_pinned: !currentPinStatus });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, is_pinned: !currentPinStatus } : n))
      );
    } catch (e) {
      console.error("Failed to toggle pin:", e);
      loadProjectData();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    } catch (e) {
      console.error("Failed to delete note:", e);
      loadProjectData();
    }
  };

  const handleUpdateTitle = async (noteId: string, newTitle: string) => {
    try {
      await updateNote(noteId, { title: newTitle });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n))
      );
    } catch (e) {
      console.error("Failed to update title:", e);
      loadProjectData();
    }
  };

  const handleUpdateLabel = async (noteId: string, newLabel: string) => {
    try {
      await updateNote(noteId, { note_type: newLabel });
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, note_type: newLabel } : n))
      );
    } catch (e) {
      console.error("Failed to update label:", e);
      loadProjectData();
    }
  };

  const handleUpdateProject = async (noteId: string, projectId: string | null) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId || projectId === id));
    try {
      await updateNote(noteId, { project_id: projectId });
      await loadProjectData();
    } catch (e) {
      console.error("Failed to update project:", e);
      loadProjectData();
    }
  };

  const handleUpdateProjects = async (noteId: string, projectIds: string[]) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId || (id && projectIds.includes(id))));
    try {
      await updateNote(noteId, { project_ids: projectIds, project_id: projectIds[0] || null });
      await loadProjectData();
    } catch (e) {
      console.error("Failed to update projects:", e);
      loadProjectData();
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);

  const displayProjects = allProjects.length > 0 ? allProjects : (project ? [project] : []);

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Back & Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót do projektów</span>
        </button>

        {loading ? (
          <div className="h-20 bg-white dark:bg-[#202124] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse"></div>
        ) : error || !project ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-700 dark:text-rose-300 font-semibold mb-1">Błąd ładownia projektu</p>
            <p className="text-xs text-rose-500 dark:text-rose-400">{error || "Projekt nie istnieje"}</p>
          </div>
        ) : (
          <div 
            style={{ borderLeftColor: project.color || "#3b82f6" }}
            className="bg-white dark:bg-[#202124] rounded-2xl border border-slate-200/80 dark:border-slate-800 border-l-4 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center space-x-2.5 mb-1.5">
                <FolderKanban className="w-6 h-6" style={{ color: project.color || "#3b82f6" }} />
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{project.name}</h1>
              </div>
              {project.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-y-2">
              <button
                type="button"
                onClick={() => setIsTimelineOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#143109] dark:text-[#AAAE7F] bg-[#D0D6B3]/40 hover:bg-[#D0D6B3]/70 border border-[#AAAE7F]/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Otwórz oś czasu wydarzeń projektu"
              >
                <CalendarDays className="w-4 h-4 text-[#143109] dark:text-[#AAAE7F]" />
                <span>Oś czasu</span>
              </button>

              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-[#EFEFEF] dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>{notes.length} notatek</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#D0D6B3] text-[#143109] border border-[#AAAE7F]/40">
                Aktywny
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar pre-configured for this project */}
      {project && (
        <KeepInputBar onSuccess={loadProjectData} projectId={project.id} />
      )}

      {/* Notes Grid */}
      {!loading && project && (
        notes.length === 0 ? (
          <div className="bg-white dark:bg-[#202124] rounded-3xl p-12 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 shadow-sm max-w-lg mx-auto my-8">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brak notatek w tym projekcie
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wpisz wiadomość lub utwórz nagranie w powyższym formularzu, aby dodać pierwszą notatkę do projektu.
            </p>
          </div>
        ) : (
          <section className="space-y-6 mt-6">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  PRZYPIĘTE
                </h3>
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="flex w-auto -ml-4"
                  columnClassName="pl-4 bg-clip-padding space-y-4"
                >
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      projects={displayProjects}
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
                </Masonry>
              </div>
            )}

            {/* Unpinned Notes */}
            {unpinnedNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 pt-2">
                    INNE NOTATKI PROJEKTOWE
                  </h3>
                )}
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="flex w-auto -ml-4"
                  columnClassName="pl-4 bg-clip-padding space-y-4"
                >
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      projects={displayProjects}
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
                </Masonry>
              </div>
            )}
          </section>
        )
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          projects={displayProjects}
          onClose={() => setSelectedNoteId(null)}
          formatNoteDate={formatNoteDate}
          handleNoteContentChange={handleNoteContentChange}
          onTogglePin={handleTogglePin}
          onDelete={(id) => {
            handleDeleteNote(id);
            setSelectedNoteId(null);
          }}
          onUpdateTitle={handleUpdateTitle}
          onUpdateLabel={handleUpdateLabel}
          onUpdateProject={handleUpdateProject}
          onUpdateProjects={handleUpdateProjects}
          onReanalyze={handleReanalyzeNote}
        />
      )}

      {/* Project Timeline Drawer */}
      {project && (
        <ProjectTimelineDrawer
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          project={project}
          notes={notes}
          onSelectNote={(noteId) => setSelectedNoteId(noteId)}
        />
      )}
    </main>
  );
};
