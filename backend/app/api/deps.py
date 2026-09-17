from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import User
from app.core.security import decode_access_token
from app.services.auth_service import auth_service

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user_optional(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Returns the authenticated user if a valid bearer token is present, otherwise None."""
    if not auth_header:
        return None
    token = auth_header.credentials
    user_id_str = decode_access_token(token)
    if not user_id_str:
        return None
    try:
        user_id = int(user_id_str)
        user = await auth_service.get_user_by_id(db, user_id)
        return user
    except Exception:
        return None

async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    """Enforces authentication; raises 401 if not logged in."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
