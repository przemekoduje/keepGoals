import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface NoteEvent {
  title: string;
  date_start: string;
  date_end: string;
  description?: string;
}

export interface Delegation {
  id: string;
  note_id: string;
  delegated_to_name: string;
  delegated_to_email?: string;
  delegation_status: 'sent' | 'viewed' | 'done' | string;
  share_token: string;
  ai_summary_for_delegate?: string;
  created_at: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  note_type: 'strategic' | 'daily_morning' | 'daily_evening' | string;
  project_id?: string;
  project_ids?: string[];
  assigned_to?: string;
  assigned_user_ids?: string[];
  pending_user_ids?: string[];
  suggested_assignees?: string[];
  is_pinned?: boolean;
  user_id: string;
  created_at: string;
  media_url?: string;
  media_type?: string;
  raw_transcript?: string;
  processing_status?: 'completed' | 'pending' | 'error_transcription' | 'error_ai' | string;
  order?: number;
  is_deleted?: boolean;
  deleted_at?: string;
  events?: NoteEvent[];
  delegated_to_name?: string;
  delegated_to_email?: string;
  delegation_status?: 'sent' | 'viewed' | 'done' | string;
  share_token?: string;
  ai_summary_for_delegate?: string;
  delegations?: Delegation[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'archived' | 'completed';
  user_id: string;
  created_at: string;
  notes_count?: number;
  notes?: Note[];
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  color?: string;
  status?: 'active' | 'archived' | 'completed';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  member_ids: string[];
  created_at: string;
}

export interface TeamCreateData {
  name: string;
  description?: string;
  member_emails?: string[];
}

export interface UserSettings {
  trash_retention_days: number;
  timezone?: string;
}

export async function getAuthHeaders(isMultipart = false): Promise<HeadersInit> {
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

export async function fetchNotes(projectId?: string): Promise<Note[]> {
  const headers = await getAuthHeaders();
  const url = projectId 
    ? `${API_URL}/api/v1/notes?project_id=${projectId}`
    : `${API_URL}/api/v1/notes`;
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania notatek: ${response.status}`);
  }
  
  return response.json();
}

export async function createNote(noteData: { title?: string; content: string; note_type: string; is_pinned?: boolean; project_id?: string; project_ids?: string[] }): Promise<Note> {
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

export async function updateNote(noteId: string, noteData: { title?: string; content?: string; note_type?: string; is_pinned?: boolean; project_id?: string | null; project_ids?: string[]; assigned_user_ids?: string[] }): Promise<Note> {
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

export async function uploadAudio(file: Blob | File): Promise<Note> {
  if (!file || file.size === 0) {
    throw new Error("Plik nagrania audio jest pusty (0 B). Nagraj ponownie.");
  }
  const headers = await getAuthHeaders(true);
  const formData = new FormData();
  let ext = 'wav';
  if (file.type.includes('mp4') || file.type.includes('m4a')) ext = 'm4a';
  else if (file.type.includes('webm')) ext = 'webm';
  else if (file.type.includes('wav')) ext = 'wav';
  const fileName = (file as File).name || `recording.${ext}`;
  formData.append("file", file, fileName);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/notes/audio`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Load failed") || msg.includes("Failed to fetch")) {
      throw new Error("Błąd sieci podczas wysyłania nagrania (Load failed). Sprawdź połączenie.");
    }
    throw err;
  }

  if (!response.ok) {
    let detail = `Błąd wysyłania notatki audio: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.detail?.message) detail = errData.detail.message;
      else if (errData?.message) detail = errData.message;
    } catch {}
    throw new Error(detail);
  }

  return response.json();
}

export async function uploadVideo(file: Blob | File): Promise<Note> {
  if (!file || file.size === 0) {
    throw new Error("Plik nagrania wideo jest pusty (0 B). Nagraj ponownie.");
  }
  const headers = await getAuthHeaders(true);
  const formData = new FormData();
  const ext = file.type.includes('mp4') ? 'mp4' : file.type.includes('quicktime') ? 'mov' : 'webm';
  const fileName = (file as File).name || `video.${ext}`;
  formData.append("file", file, fileName);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1/notes/video`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (err: any) {
    const msg = err?.message || "";
    if (msg.includes("Load failed") || msg.includes("Failed to fetch")) {
      throw new Error("Błąd sieci podczas wysyłania wideo (Load failed). Sprawdź połączenie.");
    }
    throw err;
  }

  if (!response.ok) {
    let detail = `Błąd wysyłania notatki wideo: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.detail?.message) detail = errData.detail.message;
      else if (errData?.message) detail = errData.message;
    } catch {}
    throw new Error(detail);
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

export async function fetchTrashNotes(): Promise<Note[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/trash`, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania kosza: ${response.status}`);
  }
  
  return response.json();
}

export async function restoreNote(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/restore`, {
    method: "PUT",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd przywracania notatki: ${response.status}`);
  }
}

export async function hardDeleteNote(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/hard`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd trwałego usuwania notatki: ${response.status}`);
  }
}

export async function fetchUserSettings(): Promise<UserSettings> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/users/settings`, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Błąd pobierania ustawień: ${response.status}`);
  }
  
  return response.json();
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/users/settings`, {
    method: "PUT",
    headers,
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`Błąd zapisu ustawień: ${response.status}`);
  }

  return response.json();
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

export interface ChatMessage {
  role: 'user' | 'assistant' | string;
  content: string;
}

export async function chatAboutNote(noteId: string, messages: ChatMessage[]): Promise<{ response: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/ai-chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Błąd czatu AI: ${response.status}`);
  }

  return response.json();
}

export async function sendNoteEmail(noteId: string, email: string): Promise<{ success: boolean; sent_via_smtp: boolean; message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/send-email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || `Błąd wysyłania e-maila: ${response.status}`);
  }

  return response.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania projektów: ${response.status}`);
  }

  return response.json();
}

export async function createProject(projectData: ProjectCreateData): Promise<Project> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error(`Błąd tworzenia projektu: ${response.status}`);
  }

  return response.json();
}

export async function fetchProjectDetails(projectId: string): Promise<Project> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania szczegółów projektu: ${response.status}`);
  }

  return response.json();
}

export async function deleteProject(projectId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania projektu: ${response.status}`);
  }
}

export async function reanalyzeNote(noteId: string): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/reanalyze`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd ponownego uruchamiania analizy AI: ${response.status}`);
  }

  return response.json();
}

export async function fetchTeams(): Promise<Team[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania zespołów: ${response.status}`);
  }

  return response.json();
}

export async function createTeam(teamData: TeamCreateData): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams`, {
    method: "POST",
    headers,
    body: JSON.stringify(teamData),
  });

  if (!response.ok) {
    throw new Error(`Błąd tworzenia zespołu: ${response.status}`);
  }

  return response.json();
}

export async function deleteTeam(teamId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams/${teamId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania zespołu: ${response.status}`);
  }
}

export async function addTeamMember(teamId: string, emailOrUid: string): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams/${teamId}/members`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email_or_uid: emailOrUid }),
  });

  if (!response.ok) {
    throw new Error(`Błąd dodawania członka do zespołu: ${response.status}`);
  }

  return response.json();
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<Team> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/teams/${teamId}/members/${encodeURIComponent(memberId)}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd usuwania członka zespołu: ${response.status}`);
  }

  return response.json();
}

export async function acceptNoteInvite(noteId: string): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/accept_invite`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd podczas akceptacji zaproszenia: ${response.status}`);
  }

  return response.json();
}

export async function rejectNoteInvite(noteId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/reject_invite`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Błąd podczas odrzucania zaproszenia: ${response.status}`);
  }
}

export async function handoffNote(noteId: string, delegateName: string, delegateEmail?: string): Promise<Note> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/notes/${noteId}/handoff`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      delegate_name: delegateName,
      delegate_email: delegateEmail || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Błąd podczas delegacji: ${response.status}`);
  }

  return response.json();
}

export interface PublicNote {
  id: string;
  title?: string;
  content?: string;
  delegated_to_name?: string;
  delegated_to_email?: string;
  delegation_status: string;
  ai_summary_for_delegate?: string;
  created_at: string;
}

export async function fetchPublicNote(shareToken: string): Promise<PublicNote> {
  const response = await fetch(`${API_URL}/api/v1/public/notes/${shareToken}`);
  if (!response.ok) {
    throw new Error(`Błąd podczas pobierania publicznej notatki: ${response.status}`);
  }
  return response.json();
}

export async function completePublicNote(shareToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/public/notes/${shareToken}/complete`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Błąd podczas oznaczania jako zrealizowane: ${response.status}`);
  }
}

export type GoalHorizon = 'long_term' | 'quarterly' | 'monthly';

export interface KeyResult {
  id?: string;
  title: string;
  current_value: number;
  target_value: number;
  unit: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  horizon: GoalHorizon;
  key_results: KeyResult[];
  project_id?: string;
  color?: string;
  is_completed: boolean;
  completed_at?: string;
  order: number;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  horizon?: GoalHorizon;
  key_results?: KeyResult[];
  project_id?: string;
  color?: string;
  is_completed?: boolean;
  order?: number;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  horizon?: GoalHorizon;
  key_results?: KeyResult[];
  project_id?: string | null;
  color?: string;
  is_completed?: boolean;
  completed_at?: string | null;
  order?: number;
}

export async function fetchGoals(horizon?: GoalHorizon, isCompleted?: boolean): Promise<Goal[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (horizon) params.append("horizon", horizon);
  if (isCompleted !== undefined) params.append("is_completed", String(isCompleted));
  
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${API_URL}/api/v1/goals${query}`, {
    method: "GET",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Błąd pobierania celów: ${response.status}`);
  }
  return response.json();
}

export async function createGoal(payload: CreateGoalPayload): Promise<Goal> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/goals`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Błąd tworzenia celu: ${response.status}`);
  }
  return response.json();
}

export async function updateGoal(goalId: string, payload: UpdateGoalPayload): Promise<Goal> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/goals/${goalId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Błąd aktualizacji celu: ${response.status}`);
  }
  return response.json();
}

export async function deleteGoal(goalId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/goals/${goalId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Błąd usuwania celu: ${response.status}`);
  }
}

export interface AxisTile {
  id: string;
  title: string;
  x: number;
  y: number;
}

export async function fetchAxisTiles(): Promise<AxisTile[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/goals/axis-tiles`, {
    method: "GET",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Błąd pobierania kafelków osi: ${response.status}`);
  }
  return response.json();
}

export async function saveAxisTiles(tiles: AxisTile[]): Promise<AxisTile[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/v1/goals/axis-tiles`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ tiles }),
  });
  if (!response.ok) {
    throw new Error(`Błąd zapisu kafelków osi: ${response.status}`);
  }
  return response.json();
}

