import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    template_id = Column(String(64), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    field_data = Column(JSON, default=dict)
    rendered_content = Column(Text, nullable=True)
    status = Column(String(32), default="draft")  # draft, in_progress, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="documents")
    chat_sessions = relationship("ChatSession", back_populates="document", cascade="all, delete-orphan")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    messages = Column(JSON, default=list)  # list of {role, content, extracted_fields, timestamp}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    document = relationship("Document", back_populates="chat_sessions")
