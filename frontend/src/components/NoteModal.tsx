import React, { useEffect, useState, useRef } from "react";
import { 
  Palette, Bell, Users, Image as ImageIcon, Archive, MoreVertical, Pin, 
  Trash2, Type, Tag, Heading1, Heading2, Bold, Italic, Underline, Baseline, Eraser,
  List, ListOrdered, ListTodo, Sparkles
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { NoteAIChatModal } from "./NoteAIChatModal";
import type { Note } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "";

interface NoteModalProps {
  note: Note;
  onClose: () => void;
  formatNoteDate: (dateStr: string) => string;
  handleNoteContentChange: (noteId: string, newContent: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPinStatus: boolean) => void;
  onDelete?: (noteId: string) => void;
  onUpdateTitle?: (noteId: string, newTitle: string) => void;
  onUpdateLabel?: (noteId: string, newLabel: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  onClose,
  formatNoteDate,
  handleNoteContentChange,
  onTogglePin,
  onDelete,
  onUpdateTitle,
  onUpdateLabel,
}) => {
  const isAudio = note.media_type?.startsWith("audio/");
  const isVideo = note.media_type?.startsWith("video/");
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFormattingBar, setShowFormattingBar] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(note.content);
  }, [note.content]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
          setShowFormattingBar(false);
          if (editContent !== note.content) {
            handleNoteContentChange(note.id, editContent);
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isEditing, editContent, note.content, note.id, handleNoteContentChange]);

  // Click outside menu
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, [isMenuOpen]);

  // Click outside editor to exit edit mode
  useEffect(() => {
    const handleClickOutsideEditor = (event: MouseEvent) => {
      if (
        isEditing &&
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setShowFormattingBar(false);
        if (editContent !== note.content) {
          handleNoteContentChange(note.id, editContent);
        }
      }
    };
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutsideEditor);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideEditor);
  }, [isEditing, editContent, note.content, note.id, handleNoteContentChange]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current && editorContainerRef.current) {
      const scrollPos = editorContainerRef.current.scrollTop;
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      editorContainerRef.current.scrollTop = scrollPos;
    }
  }, [editContent, isEditing]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      if (isEditing && editContent !== note.content) {
        handleNoteContentChange(note.id, editContent);
      }
      onClose();
    }
  };

  const applyFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = editContent.substring(start, end);
    const newText = editContent.substring(0, start) + prefix + selectedText + suffix + editContent.substring(end);
    setEditContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const toggleHeader = (level: number) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const textBefore = editContent.substring(0, start);
    const textAfter = editContent.substring(end);
    const selectedText = editContent.substring(start, end);

    const lastNewline = textBefore.lastIndexOf("\n");
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const textBeforeLine = editContent.substring(0, lineStart);
    let currentLine = editContent.substring(lineStart, end);
    
    currentLine = currentLine.replace(/^#{1,6}\s/, ""); // remove existing headers
    const newPrefix = level === 0 ? "" : "#".repeat(level) + " ";
    
    const newText = textBeforeLine + newPrefix + currentLine + textAfter;
    setEditContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = lineStart + newPrefix.length + (start - lineStart);
        textareaRef.current.setSelectionRange(newCursor, newCursor + selectedText.length);
      }
    }, 0);
  };

  const clearFormatting = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    let selectedText = editContent.substring(start, end);
    
    // Remove bold, italic, underline, headers
    selectedText = selectedText.replace(/\*\*(.*?)\*\*/g, "$1");
    selectedText = selectedText.replace(/\*(.*?)\*/g, "$1");
    selectedText = selectedText.replace(/<u>(.*?)<\/u>/g, "$1");
    
    const newText = editContent.substring(0, start) + selectedText + editContent.substring(end);
    setEditContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + selectedText.length);
      }
    }, 0);
  };

  const toggleList = (type: 'bullet' | 'ordered' | 'todo') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const textBefore = editContent.substring(0, start);
    const textAfter = editContent.substring(end);
    
    const lastNewlineBefore = textBefore.lastIndexOf("\n");
    const lineStart = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
    
    const firstNewlineAfter = textAfter.indexOf("\n");
    const lineEnd = firstNewlineAfter === -1 ? editContent.length : end + firstNewlineAfter;
    
    const textBeforeLines = editContent.substring(0, lineStart);
    const textAfterLines = editContent.substring(lineEnd);
    const selectedLinesText = editContent.substring(lineStart, lineEnd);
    
    const lines = selectedLinesText.split("\n");
    
    const isBullet = (l: string) => /^\s*[-*]\s(?!\[)/.test(l);
    const isOrdered = (l: string) => /^\s*\d+\.\s/.test(l);
    const isTodo = (l: string) => /^\s*-\s\[[ x]\]\s/i.test(l);
    
    let allHavePrefix = false;
    if (type === 'bullet') allHavePrefix = lines.every(l => l.trim() === '' || isBullet(l));
    if (type === 'ordered') allHavePrefix = lines.every(l => l.trim() === '' || isOrdered(l));
    if (type === 'todo') allHavePrefix = lines.every(l => l.trim() === '' || isTodo(l));
    
    let counter = 1;
    const newLines = lines.map(line => {
      if (line.trim() === '') return line;
      // Strip any existing list prefix first
      let cleanLine = line.replace(/^\s*([-*]\s\[[ x]\]\s|[-*]\s|\d+\.\s)/i, "");
      
      if (allHavePrefix) {
        return cleanLine;
      } else {
        if (type === 'bullet') return `- ${cleanLine}`;
        if (type === 'ordered') return `${counter++}. ${cleanLine}`;
        if (type === 'todo') return `- [ ] ${cleanLine}`;
        return cleanLine;
      }
    });
    
    const newSelectedText = newLines.join("\n");
    const newText = textBeforeLines + newSelectedText + textAfterLines;
    
    setEditContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + newSelectedText.length);
      }
    }, 0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative bg-white dark:bg-[#202124] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Media Player Header */}
        {note.media_url && (
          <div className="w-full bg-black/5 dark:bg-black/20 flex items-center justify-center relative group">
            {isVideo && (
              <video 
                controls 
                autoPlay
                className="w-full max-h-[50vh] object-contain" 
                src={`${API_URL}${note.media_url}`}
              >
                Twoja przeglądarka nie obsługuje odtwarzacza wideo.
              </video>
            )}
            {isAudio && (
              <div className="w-full p-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <audio 
                  controls 
                  className="w-full max-w-md outline-none" 
                  src={`${API_URL}${note.media_url}`}
                >
                  Twoja przeglądarka nie obsługuje odtwarzacza audio.
                </audio>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 dark:text-slate-100 relative" ref={editorContainerRef}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 rounded-md">
                {note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {formatNoteDate(note.created_at)}
              </span>
            </div>
            <button 
              type="button"
              onClick={() => onTogglePin?.(note.id, !!note.is_pinned)}
              className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ${
                note.is_pinned
                  ? "text-amber-500 fill-amber-500 hover:text-amber-600 dark:text-amber-400 dark:fill-amber-400"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title={note.is_pinned ? "Odpnij notatkę" : "Przypnij notatkę"}
            >
              <Pin className={`w-5 h-5 ${note.is_pinned ? "fill-current" : ""}`} />
            </button>
          </div>

          {note.title && (
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              {note.title}
            </h2>
          )}

          <div 
            className="prose prose-slate dark:prose-invert max-w-none min-h-[100px]"
            onClick={() => {
              if (!isEditing) setIsEditing(true);
            }}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const value = target.value;
                    
                    const textBefore = value.substring(0, start);
                    const lines = textBefore.split('\n');
                    const currentLine = lines[lines.length - 1];
                    
                    const match = currentLine.match(/^(\s*)([-*]\s\[[ x]\]\s|[-*]\s|\d+\.\s)/i);
                    if (match) {
                      e.preventDefault();
                      const indent = match[1];
                      const prefix = match[2];
                      
                      if (currentLine.trim() === prefix.trim()) {
                        // Empty list item, remove it and exit list
                        const newTextBefore = lines.slice(0, -1).join('\n') + '\n' + indent;
                        setEditContent(newTextBefore + value.substring(end));
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newTextBefore.length;
                          }
                        }, 0);
                      } else {
                        // Add new list item
                        let newPrefix = prefix;
                        if (/^\d+\.\s/.test(prefix)) {
                          const num = parseInt(prefix, 10);
                          newPrefix = `${num + 1}. `;
                        } else if (/\[x\]/i.test(prefix)) {
                          newPrefix = prefix.replace(/x/i, ' '); // New checkbox is unchecked
                        }
                        
                        const insert = `\n${indent}${newPrefix}`;
                        setEditContent(textBefore + insert + value.substring(end));
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + insert.length;
                          }
                        }, 0);
                      }
                    }
                  }
                }}
                autoFocus
                className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 m-0 text-slate-700 dark:text-slate-300 font-sans text-sm leading-relaxed outline-none"
                placeholder="Wpisz treść notatki..."
              />
            ) : (
              <MarkdownRenderer
                content={note.content}
                onChange={(newContent) => handleNoteContentChange(note.id, newContent)}
              />
            )}
          </div>

          {/* Formatting Toolbar */}
          {showFormattingBar && isEditing && (
            <div className="absolute bottom-0 left-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg p-1.5 flex items-center space-x-1 animate-in slide-in-from-bottom-2 fade-in duration-200 z-10">
              <button type="button" onClick={() => toggleHeader(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-semibold" title="Nagłówek 1">
                H1
              </button>
              <button type="button" onClick={() => toggleHeader(2)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-semibold" title="Nagłówek 2">
                H2
              </button>
              <button type="button" onClick={() => toggleHeader(0)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center h-9 w-9" title="Zwykły tekst">
                Aa
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={() => applyFormatting("**", "**")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Pogrubienie">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyFormatting("*", "*")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Kursywa">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyFormatting("<u>", "</u>")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Podkreślenie">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={() => toggleList('bullet')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Lista wypunktowana">
                <List className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toggleList('ordered')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Lista numerowana">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toggleList('todo')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Lista zadań (Checkbox)">
                <ListTodo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={clearFormatting} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Usuń formatowanie">
                <Eraser className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button type="button" className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" title="Zmień kolor">
              <Palette className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hidden sm:block" title="Przypomnij mi">
              <Bell className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors hidden sm:block" title="Współpracownik">
              <Users className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" title="Dodaj obraz">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" title="Archiwizuj">
              <Archive className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full p-2 text-blue-500 transition-colors relative group" 
              title="Supermoc AI"
              onClick={() => setShowAiChat(true)}
            >
              <Sparkles className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-[#202124]"></span>
            </button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(true);
                setShowFormattingBar(!showFormattingBar);
              }}
              className={`rounded-full p-2 transition-colors ${
                showFormattingBar 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' 
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Opcje formatowania"
            >
              <Baseline className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={menuRef}>
              <button 
                type="button" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" 
                title="Więcej"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      const newTitle = window.prompt("Podaj nowy tytuł notatki:", note.title || "");
                      if (newTitle !== null) {
                        onUpdateTitle?.(note.id, newTitle);
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    <Type className="w-4 h-4" />
                    <span>Zmień tytuł</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      const currentLabel = note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type;
                      const newLabel = window.prompt("Podaj nową etykietę:", currentLabel);
                      if (newLabel !== null && newLabel.trim() !== "") {
                        onUpdateLabel?.(note.id, newLabel.trim());
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Zmień etykietę</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (isEditing && editContent !== note.content) {
                        handleNoteContentChange(note.id, editContent);
                      }
                      onClose();
                      onDelete?.(note.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center space-x-3 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Usuń notatkę</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (isEditing && editContent !== note.content) {
                handleNoteContentChange(note.id, editContent);
              }
              onClose();
            }}
            className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
      
      {showAiChat && (
        <NoteAIChatModal
          note={{ ...note, content: editContent }} // przekaż aktualnie edytowaną treść
          onClose={() => setShowAiChat(false)}
          onNoteUpdated={(updatedNote) => {
            setEditContent(updatedNote.content);
            handleNoteContentChange(updatedNote.id, updatedNote.content);
          }}
        />
      )}
    </div>
  );
};
