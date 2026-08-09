from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from src.auth import verify_token
from src.database import get_db
from src.schemas import ProjectCreate, ProjectResponse
from src import crud

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

@router.get("", response_model=List[ProjectResponse])
def read_projects(current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Pobiera listę wszystkich projektów zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.get_projects(db, uid)

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(project_in: ProjectCreate, current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Tworzy nowy projekt dla zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.create_project(db, uid, project_in)

@router.get("/{project_id}", response_model=Dict[str, Any])
def read_project_details(project_id: str, current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Pobiera szczegóły danego projektu wraz z filtrowaną listą powiązanych notatek.
    """
    uid = current_user["uid"]
    project = crud.get_project(db, uid, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie został znaleziony")
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(project_id: str, current_user: dict = Depends(verify_token), db=Depends(get_db)):
    """
    Usuwa podany projekt użytkownika.
    """
    uid = current_user["uid"]
    success = crud.delete_project(db, uid, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Projekt nie został znaleziony")
    return None
