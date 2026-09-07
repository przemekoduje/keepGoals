from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from src.schemas import NoteCreate, NoteUpdate, NoteReorderRequest, UserSettingsBase, ProjectCreate, ProjectUpdate, TeamCreate, TeamUpdate, GoalCreate, GoalUpdate, AxisTileItem

def get_notes_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji notatek zalogowanego użytkownika:
    users/{uid}/notes
    """
    return db.collection("users").document(uid).collection("notes")

def get_projects_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji projektów zalogowanego użytkownika:
    users/{uid}/projects
    """
    return db.collection("users").document(uid).collection("projects")

def get_settings_ref(db, uid: str):
    return db.collection("users").document(uid).collection("settings").document("preferences")

def create_project(db, uid: str, project_in: ProjectCreate) -> Dict[str, Any]:
    projects_ref = get_projects_ref(db, uid)
    doc_ref = projects_ref.document()
    
    project_data = project_in.model_dump()
    project_data["user_id"] = uid
    project_data["created_at"] = datetime.now(timezone.utc)
    
    doc_ref.set(project_data)
    project_data["id"] = doc_ref.id
    project_data["notes_count"] = 0
    return project_data

def get_projects(db, uid: str) -> List[Dict[str, Any]]:
    projects_ref = get_projects_ref(db, uid)
    project_docs = projects_ref.stream()
    
    # Calculate notes count per project
    notes = get_notes(db, uid)
    notes_count_map: Dict[str, int] = {}
    for n in notes:
        pids = set(n.get("project_ids") or [])
        if n.get("project_id"):
            pids.add(n.get("project_id"))
        for pid in pids:
            notes_count_map[pid] = notes_count_map.get(pid, 0) + 1

    projects = []
    for doc in project_docs:
        data = doc.to_dict()
        data["id"] = doc.id
        data["notes_count"] = notes_count_map.get(doc.id, 0)
        projects.append(data)
        
    def get_sort_key(p):
        val = p.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
        return -dt.timestamp()

    projects.sort(key=get_sort_key)
    return projects

def get_project(db, uid: str, project_id: str) -> Optional[Dict[str, Any]]:
    projects_ref = get_projects_ref(db, uid)
    doc = projects_ref.document(project_id).get()
    if not doc.exists:
        return None
        
    data = doc.to_dict()
    data["id"] = doc.id
    
    # Fetch notes belonging to this project
    all_notes = get_notes(db, uid, project_id=project_id)
    data["notes"] = all_notes
    data["notes_count"] = len(all_notes)
    return data

def delete_project(db, uid: str, project_id: str) -> bool:
    projects_ref = get_projects_ref(db, uid)
    doc_ref = projects_ref.document(project_id)
    if not doc_ref.get().exists:
        return False
        
    doc_ref.delete()
    
    # Unassign project_id from notes associated with this project
    notes_ref = get_notes_ref(db, uid)
    notes_docs = notes_ref.stream()
    for n_doc in notes_docs:
        n_data = n_doc.to_dict()
        pids = n_data.get("project_ids") or []
        single_pid = n_data.get("project_id")
        if project_id in pids or single_pid == project_id:
            new_pids = [p for p in pids if p != project_id]
            new_single = single_pid if single_pid != project_id else (new_pids[0] if new_pids else None)
            notes_ref.document(n_doc.id).update({
                "project_ids": new_pids,
                "project_id": new_single
            })
            
    return True

def get_user_settings(db, uid: str) -> Dict[str, Any]:
    settings_doc = get_settings_ref(db, uid).get()
    if settings_doc.exists:
        data = settings_doc.to_dict()
        if "timezone" not in data or not data["timezone"]:
            data["timezone"] = "Europe/Warsaw"
        return data
    # Default settings
    return {"trash_retention_days": 30, "timezone": "Europe/Warsaw"}

def update_user_settings(db, uid: str, settings: UserSettingsBase) -> Dict[str, Any]:
    doc_ref = get_settings_ref(db, uid)
    settings_data = settings.model_dump()
    doc_ref.set(settings_data)
    return settings_data

def get_teams_ref(db):
    return db.collection("teams")

def create_team(db, uid: str, team_in: TeamCreate) -> Dict[str, Any]:
    teams_ref = get_teams_ref(db)
    doc_ref = teams_ref.document()
    
    team_data = team_in.model_dump()
    team_data["owner_id"] = uid
    team_data["created_at"] = datetime.now(timezone.utc)
    
    members = list(set(team_data.get("member_emails") or []))
    if uid not in members:
        members.append(uid)
    team_data["member_ids"] = members
    if "member_emails" in team_data:
        del team_data["member_emails"]
        
    doc_ref.set(team_data)
    team_data["id"] = doc_ref.id
    return team_data

def get_user_teams(db, uid: str) -> List[Dict[str, Any]]:
    teams_ref = get_teams_ref(db)
    docs = teams_ref.stream()
    
    user_teams = []
    for doc in docs:
        data = doc.to_dict()
        owner = data.get("owner_id")
        members = data.get("member_ids") or []
        if owner == uid or uid in members:
            data["id"] = doc.id
            user_teams.append(data)
    return user_teams

def get_team(db, team_id: str) -> Optional[Dict[str, Any]]:
    doc_ref = get_teams_ref(db).document(team_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    return None

def delete_team(db, uid: str, team_id: str) -> bool:
    team = get_team(db, team_id)
    if not team or team.get("owner_id") != uid:
        return False
    get_teams_ref(db).document(team_id).delete()
    return True

def add_team_member(db, uid: str, team_id: str, email_or_uid: str) -> Optional[Dict[str, Any]]:
    team = get_team(db, team_id)
    if not team:
        return None
    members = team.get("member_ids") or []
    if email_or_uid not in members:
        members.append(email_or_uid)
        get_teams_ref(db).document(team_id).update({"member_ids": members})
        team["member_ids"] = members
    return team

def remove_team_member(db, uid: str, team_id: str, member_id: str) -> Optional[Dict[str, Any]]:
    team = get_team(db, team_id)
    if not team:
        return None
    members = team.get("member_ids") or []
    if member_id in members:
        members.remove(member_id)
        get_teams_ref(db).document(team_id).update({"member_ids": members})
        team["member_ids"] = members
    return team

def create_note(db, uid: str, note_in: NoteCreate) -> Dict[str, Any]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document()
    
    note_data = note_in.model_dump()
    note_data["user_id"] = uid
    note_data["created_at"] = datetime.now(timezone.utc)
    note_data["is_deleted"] = False
    note_data["deleted_at"] = None
    if "processing_status" not in note_data or not note_data["processing_status"]:
        note_data["processing_status"] = "completed"
    
    pids = note_data.get("project_ids") or []
    if note_data.get("project_id") and note_data["project_id"] not in pids:
        pids.append(note_data["project_id"])
    note_data["project_ids"] = pids
    note_data["project_id"] = pids[0] if pids else None

    # Sync assigned_user_ids and assigned_to
    assignees = list(note_data.get("assigned_user_ids") or [])
    if note_data.get("assigned_to") and note_data["assigned_to"] not in assignees:
        assignees.append(note_data["assigned_to"])
    note_data["assigned_user_ids"] = assignees
    note_data["assigned_to"] = assignees[0] if assignees else None

    # Firestore max document limit safety (1MB limit)
    if isinstance(note_data.get("content"), str) and len(note_data["content"].encode('utf-8')) > 1000000:
        note_data["content"] = note_data["content"][:500000] + "\n\n[Treść notatki została skrócona ze względu na limit rozmiaru dokumentu w bazie danych]"

    doc_ref.set(note_data)
    
    note_data["id"] = doc_ref.id
    return note_data

def get_note_delegations(db, note_ref) -> List[Dict[str, Any]]:
    try:
        delegations_ref = note_ref.collection("delegations")
        delegations = []
        for doc in delegations_ref.stream():
            del_data = doc.to_dict()
            del_data["id"] = doc.id
            del_data["note_id"] = note_ref.id
            delegations.append(del_data)
        return delegations
    except Exception as e:
        print(f"Error fetching delegations: {e}")
        return []

def get_notes(db, uid: str, email: Optional[str] = None, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
    # 1. Moje notatki
    notes_ref = get_notes_ref(db, uid)
    docs_my = list(notes_ref.stream())
    
    # Unikalne notatki (tylko moje w nowym podejściu)
    all_docs = {}
    for doc in docs_my:
        all_docs[doc.id] = doc

    notes = []
    for doc_id, doc in all_docs.items():
        data = doc.to_dict()
        # Filter out deleted notes
        if data.get("is_deleted", False):
            continue

        pids = set(data.get("project_ids") or [])
        if data.get("project_id"):
            pids.add(data.get("project_id"))

        if project_id and project_id not in pids:
            continue

        data["id"] = doc.id
        data["project_ids"] = list(pids)
        data["project_id"] = data["project_ids"][0] if data["project_ids"] else None
        
        assignees = list(data.get("assigned_user_ids") or [])
        if data.get("assigned_to") and data["assigned_to"] not in assignees:
            assignees.append(data["assigned_to"])
        data["assigned_user_ids"] = assignees
        data["assigned_to"] = assignees[0] if assignees else None
        
        # Pobierz delegacje (one-to-many)
        data["delegations"] = get_note_delegations(db, doc.reference)
        
        notes.append(data)
        
    def get_sort_key(x):
        val = x.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
            
        order_val = x.get("order", 0)
        return (order_val, -dt.timestamp())

    notes.sort(key=get_sort_key)
    return notes

def get_trash_notes(db, uid: str) -> List[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    docs = notes_ref.stream()
    
    user_settings = get_user_settings(db, uid)
    retention_days = user_settings.get("trash_retention_days", 30)
    
    notes = []
    now = datetime.now(timezone.utc)
    
    for doc in docs:
        data = doc.to_dict()
        if not data.get("is_deleted", False):
            continue
            
        deleted_at = data.get("deleted_at")
        if isinstance(deleted_at, str):
            try:
                deleted_at = datetime.fromisoformat(deleted_at)
            except:
                deleted_at = None
                
        # Lazy cleanup
        if retention_days > 0 and deleted_at:
            if now - deleted_at > timedelta(days=retention_days):
                # Expired, hard delete it now
                notes_ref.document(doc.id).delete()
                continue
                
        data["id"] = doc.id
        data["processing_status"] = data.get("processing_status", "completed")
        notes.append(data)
        
    def get_sort_key(x):
        val = x.get("deleted_at") or x.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
        return -dt.timestamp()

    notes.sort(key=get_sort_key)
    return notes

def get_note(db, uid: str, note_id: str) -> Optional[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        data["processing_status"] = data.get("processing_status", "completed")
        assignees = list(data.get("assigned_user_ids") or [])
        if data.get("assigned_to") and data["assigned_to"] not in assignees:
            assignees.append(data["assigned_to"])
        data["assigned_user_ids"] = assignees
        data["assigned_to"] = assignees[0] if assignees else None
        
        # Pobierz delegacje
        data["delegations"] = get_note_delegations(db, doc_ref)
        
        return data
    return None

def update_note(db, uid: str, note_id: str, note_in: NoteUpdate) -> Optional[Dict[str, Any]]:
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return None
        
    data = doc.to_dict()
    update_data = note_in.model_dump(exclude_unset=True)
    if update_data:
        if "project_ids" in update_data and update_data["project_ids"] is not None:
            pids = update_data["project_ids"]
            update_data["project_id"] = pids[0] if pids else None
        elif "project_id" in update_data:
            pid = update_data["project_id"]
            update_data["project_ids"] = [pid] if pid else []

        if "assigned_user_ids" in update_data and update_data["assigned_user_ids"] is not None:
            # Personal-First: proste zastąpienie listy
            new_assignees = list(update_data["assigned_user_ids"])
            update_data["assigned_user_ids"] = new_assignees
            update_data["assigned_to"] = new_assignees[0] if new_assignees else None

        data.update(update_data)
        doc_ref.update(update_data)
        
    data["id"] = doc.id
    pids = list(set(data.get("project_ids") or []))
    if data.get("project_id") and data["project_id"] not in pids:
        pids.append(data["project_id"])
    data["project_ids"] = pids
    data["project_id"] = pids[0] if pids else None
    data["processing_status"] = data.get("processing_status", "completed")
    return data

def delete_note(db, uid: str, note_id: str) -> bool:
    """Soft delete a note"""
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
        
    # Set to deleted
    doc_ref.update({
        "is_deleted": True,
        "deleted_at": datetime.now(timezone.utc)
    })
    return True

def restore_note(db, uid: str, note_id: str) -> bool:
    """Restore a soft-deleted note"""
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
        
    doc_ref.update({
        "is_deleted": False,
        "deleted_at": None
    })
    return True

def hard_delete_note(db, uid: str, note_id: str) -> bool:
    """Permanently delete a note"""
    notes_ref = get_notes_ref(db, uid)
    doc_ref = notes_ref.document(note_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
        
    doc_ref.delete()
    return True

def reorder_notes(db, uid: str, reorder_request: NoteReorderRequest) -> bool:
    notes_ref = get_notes_ref(db, uid)
    batch = db.batch()
    
    for update in reorder_request.updates:
        doc_ref = notes_ref.document(update.id)
        batch.update(doc_ref, {"order": update.order})
        
    batch.commit()
    return True

def get_goals_ref(db, uid: str):
    """
    Zwraca referencję do subkolekcji celów zalogowanego użytkownika:
    users/{uid}/goals
    """
    return db.collection("users").document(uid).collection("goals")

def create_goal(db, uid: str, goal_in: GoalCreate) -> Dict[str, Any]:
    goals_ref = get_goals_ref(db, uid)
    doc_ref = goals_ref.document()
    
    goal_data = goal_in.model_dump()
    goal_data["user_id"] = uid
    goal_data["created_at"] = datetime.now(timezone.utc)
    goal_data["updated_at"] = datetime.now(timezone.utc)
    
    doc_ref.set(goal_data)
    goal_data["id"] = doc_ref.id
    return goal_data

def get_goals(db, uid: str, horizon: Optional[str] = None, is_completed: Optional[bool] = None) -> List[Dict[str, Any]]:
    goals_ref = get_goals_ref(db, uid)
    docs = goals_ref.stream()
    
    goals = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        if horizon and data.get("horizon") != horizon:
            continue
        if is_completed is not None and data.get("is_completed", False) != is_completed:
            continue
        goals.append(data)
        
    def get_sort_key(g):
        order = g.get("order", 0)
        val = g.get("created_at")
        dt = datetime.min.replace(tzinfo=timezone.utc)
        if isinstance(val, str):
            try:
                dt = datetime.fromisoformat(val)
            except:
                pass
        elif val:
            dt = val
        return (order, -dt.timestamp())
        
    goals.sort(key=get_sort_key)
    return goals

def get_goal(db, uid: str, goal_id: str) -> Optional[Dict[str, Any]]:
    goals_ref = get_goals_ref(db, uid)
    doc = goals_ref.document(goal_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["id"] = doc.id
    return data

def update_goal(db, uid: str, goal_id: str, goal_update: GoalUpdate) -> Optional[Dict[str, Any]]:
    goals_ref = get_goals_ref(db, uid)
    doc_ref = goals_ref.document(goal_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None
        
    update_data = goal_update.model_dump(exclude_unset=True)
    if not update_data:
        data = doc.to_dict()
        data["id"] = doc.id
        return data
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    if "is_completed" in update_data:
        if update_data["is_completed"] and not update_data.get("completed_at"):
            update_data["completed_at"] = datetime.now(timezone.utc)
        elif not update_data["is_completed"]:
            update_data["completed_at"] = None

    doc_ref.update(update_data)
    updated_doc = doc_ref.get()
    data = updated_doc.to_dict()
    data["id"] = updated_doc.id
    return data

def delete_goal(db, uid: str, goal_id: str) -> bool:
    goals_ref = get_goals_ref(db, uid)
    doc_ref = goals_ref.document(goal_id)
    if not doc_ref.get().exists:
        return False
    doc_ref.delete()
    return True

def get_axis_tiles_ref(db, uid: str):
    return db.collection("users").document(uid).collection("settings").document("axis_tiles")

def get_axis_tiles(db, uid: str) -> List[Dict[str, Any]]:
    doc = get_axis_tiles_ref(db, uid).get()
    if doc.exists:
        data = doc.to_dict()
        return data.get("tiles", [])
    return []

def save_axis_tiles(db, uid: str, tiles: List[AxisTileItem]) -> List[Dict[str, Any]]:
    doc_ref = get_axis_tiles_ref(db, uid)
    tiles_data = [t.model_dump() for t in tiles]
    doc_ref.set({
        "tiles": tiles_data,
        "updated_at": datetime.now(timezone.utc)
    })
    return tiles_data

