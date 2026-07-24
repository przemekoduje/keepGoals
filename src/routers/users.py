from fastapi import APIRouter, Depends, HTTPException, status
from src.auth import verify_token
from src.database import get_db
from src.schemas import UserSettingsBase, UserSettingsResponse
from src.crud import get_user_settings, update_user_settings

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/settings", response_model=UserSettingsResponse)
def read_user_settings(
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    settings = get_user_settings(db, uid)
    return settings

@router.put("/settings", response_model=UserSettingsResponse)
def update_settings(
    settings_in: UserSettingsBase,
    user: dict = Depends(verify_token),
    db = Depends(get_db)
):
    uid = user["uid"]
    updated_settings = update_user_settings(db, uid, settings_in)
    return updated_settings
