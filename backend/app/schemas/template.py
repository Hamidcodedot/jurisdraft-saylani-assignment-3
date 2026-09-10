from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class TemplateField(BaseModel):
    key: str
    label: str
    type: str  # text, date, textarea, number, email
    default: Optional[Any] = None
    placeholder: Optional[str] = None
    description: Optional[str] = None

class TemplateSummary(BaseModel):
    id: str
    name: str
    category: str
    badge: Optional[str] = None
    estimated_time: Optional[str] = None
    file_name: str
    description: str

class TemplateDetail(TemplateSummary):
    fields: List[TemplateField]
    raw_content: Optional[str] = None
