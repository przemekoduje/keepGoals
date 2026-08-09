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

@router.post("/profiles")
def get_user_profiles(
    uids: list[str],
    user: dict = Depends(verify_token)
):
    """Pobiera dane profilowe dla listy UID korzystając z Firebase Auth."""
    from firebase_admin import auth
    
    # Filtrujemy, żeby przetwarzać tylko UID-y (odrzucamy zwykłe adresy e-mail)
    valid_uids = [uid for uid in uids if "@" not in uid]
    
    if not valid_uids:
        return {}
        
    try:
        # get_users przyjmuje listę obiektów UidIdentifier
        identifiers = [auth.UidIdentifier(uid) for uid in valid_uids]
        result = auth.get_users(identifiers)
        
        profiles = {}
        for user_record in result.users:
            profiles[user_record.uid] = {
                "email": user_record.email,
                "display_name": user_record.display_name or user_record.email
            }
        return profiles
    except Exception as e:
        print(f"Error fetching user profiles: {e}")
        return {}
