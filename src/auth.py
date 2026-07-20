import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

security = HTTPBearer(auto_error=False)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "MISSING_TOKEN",
                "message": "Brak tokenu autoryzacyjnego.",
                "trace_id": trace_id
            }
        )

    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email")
        }
    except Exception as e:
        trace_id = str(uuid.uuid4())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "INVALID_TOKEN",
                "message": "Token jest nieprawidłowy lub wygasł.",
                "trace_id": trace_id
            }
        )
