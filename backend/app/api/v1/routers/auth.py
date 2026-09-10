from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import User
from backend.app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from backend.app.services.auth_service import auth_service
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account and return JWT access token."""
    existing = await auth_service.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    user = await auth_service.create_user(db, user_in)
    return auth_service.generate_token_for_user(user)

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password and return JWT access token."""
    user = await auth_service.authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    return auth_service.generate_token_for_user(user)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile data for the authenticated user."""
    return current_user
