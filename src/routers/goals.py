from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from src.auth import verify_token
from src.database import get_db
from src.schemas import GoalCreate, GoalUpdate, GoalResponse, AxisTileItem, AxisTilesPayload
from src import crud

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])

@router.get("/axis-tiles", response_model=List[AxisTileItem])
def read_axis_tiles(
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Pobiera zapisane kafelki osi 2D zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.get_axis_tiles(db, uid)

@router.put("/axis-tiles", response_model=List[AxisTileItem])
def update_axis_tiles(
    payload: AxisTilesPayload,
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Trwale zapisuje kafelki osi 2D zalogowanego użytkownika w bazie Firestore.
    """
    uid = current_user["uid"]
    return crud.save_axis_tiles(db, uid, payload.tiles)

@router.get("", response_model=List[GoalResponse])
def read_goals(
    horizon: Optional[str] = Query(None, description="Filtruj wg horyzontu (long_term, quarterly, monthly)"),
    is_completed: Optional[bool] = Query(None, description="Filtruj wg statusu realizacji"),
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Pobiera listę celów strategicznych zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.get_goals(db, uid, horizon=horizon, is_completed=is_completed)

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_new_goal(
    goal_in: GoalCreate,
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Tworzy nowy cel strategiczny dla zalogowanego użytkownika.
    """
    uid = current_user["uid"]
    return crud.create_goal(db, uid, goal_in)

@router.get("/{goal_id}", response_model=GoalResponse)
def read_goal_details(
    goal_id: str,
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Pobiera szczegóły danego celu strategicznego.
    """
    uid = current_user["uid"]
    goal = crud.get_goal(db, uid, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Cel strategiczny nie został znaleziony")
    return goal

@router.patch("/{goal_id}", response_model=GoalResponse)
def update_existing_goal(
    goal_id: str,
    goal_update: GoalUpdate,
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Aktualizuje cel strategiczny (w tym postęp Key Results, horyzont, status ukończenia).
    """
    uid = current_user["uid"]
    updated = crud.update_goal(db, uid, goal_id, goal_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Cel strategiczny nie został znaleziony")
    return updated

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_goal(
    goal_id: str,
    current_user: dict = Depends(verify_token),
    db=Depends(get_db)
):
    """
    Usuwa podany cel strategiczny użytkownika.
    """
    uid = current_user["uid"]
    success = crud.delete_goal(db, uid, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cel strategiczny nie został znaleziony")
    return None
