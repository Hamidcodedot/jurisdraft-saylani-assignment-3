from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    extracted_fields: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    document_id: Optional[str] = None
    template_id: str
    message: str
    current_fields: Dict[str, Any] = {}
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    extracted_fields: Dict[str, Any] = {}
    all_fields: Dict[str, Any] = {}
    completion_percentage: float
    rendered_content: str
    is_complete: bool = False
    suggested_replies: List[str] = []
