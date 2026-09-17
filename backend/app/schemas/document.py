from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class DocumentBase(BaseModel):
    template_id: str
    title: str
    field_data: Dict[str, Any] = {}

class DocumentCreate(DocumentBase):
    rendered_content: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    field_data: Optional[Dict[str, Any]] = None
    rendered_content: Optional[str] = None
    status: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: str
    user_id: Optional[int] = None
    rendered_content: Optional[str] = None
    status: str
    completion_percentage: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class DocumentListItem(BaseModel):
    id: str
    template_id: str
    title: str
    status: str
    completion_percentage: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
