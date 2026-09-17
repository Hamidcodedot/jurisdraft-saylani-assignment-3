from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserCreate, Token, UserResponse

class AuthService:
    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email.lower().strip()))
        return result.scalars().first()

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def create_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email.lower().strip(),
            hashed_password=hashed_password,
            full_name=user_in.full_name.strip(),
            company_name=user_in.company_name.strip() if user_in.company_name else None,
            is_active=True
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def authenticate_user(self, db: AsyncSession, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def generate_token_for_user(self, user: User) -> Token:
        access_token = create_access_token(subject=user.id)
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

auth_service = AuthService()
