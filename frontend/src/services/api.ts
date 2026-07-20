import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface Note {
  id: string;
  title?: string;
  content: string;
  note_type: 'strategic' | 'daily_morning' | 'daily_evening';
  user_id: string;
  created_at: string;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
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

export async function createNote(noteData: { title: string; content: string; note_type: string }): Promise<Note> {
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
