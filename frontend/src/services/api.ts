import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface Note {
  id: string;
  title?: string;
  content: string;
  note_type: 'strategic' | 'daily_morning' | 'daily_evening' | string;
  is_pinned?: boolean;
  user_id: string;
  created_at: string;
  media_url?: string;
  media_type?: string;
  order?: number;
}

async function getAuthHeaders(isMultipart = false): Promise<HeadersInit> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function fetchNotes(): Promise<Note[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes`, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania notatek: ${response.status}`);
  }
  
  return response.json();
}

export async function createNote(noteData: { title?: string; content: string; note_type: string; is_pinned?: boolean }): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error(`Błąd tworzenia notatki: ${response.status}`);
  }

  return response.json();
}

export async function updateNote(noteId: string, noteData: { title?: string; content?: string; note_type?: string; is_pinned?: boolean }): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error(`Błąd aktualizacji notatki: ${response.status}`);
  }

  return response.json();
}

export async function generateMorningPlan(): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/plans/morning`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_code || `Błąd generowania planu: ${response.status}`);
  }

  return response.json();
}

export async function generateEveningReflection(reflectionData: {
  completed_tasks: string[];
  uncompleted_tasks: string[];
  avoided_habits: string[];
}): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/plans/evening`, {
    method: "POST",
    headers,
    body: JSON.stringify(reflectionData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_code || `Błąd generowania refleksji: ${response.status}`);
  }

  return response.json();
}

export async function uploadAudio(file: Blob): Promise<Note> {
  const headers = await getAuthHeaders(true);
  const formData = new FormData();
  formData.append("file", file, "recording.webm");

  const response = await fetch(`${API_URL}/api/v1/notes/audio`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Błąd wysyłania notatki audio: ${response.status}`);
  }

  return response.json();
}

export async function uploadVideo(file: Blob): Promise<Note> {
  const headers = await getAuthHeaders(true);
  const formData = new FormData();
  formData.append("file", file, "video.webm");

  const response = await fetch(`${API_URL}/api/v1/notes/video`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Błąd wysyłania notatki wideo: ${response.status}`);
  }

  return response.json();
}

export async function deleteNote(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania notatki: ${response.status}`);
  }
}

export async function reorderNotes(updates: { id: string; order: number }[]): Promise<{ message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/reorder`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || "Błąd zmiany kolejności notatek");
  }

  return response.json();
}
