from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import ai_service
from app.services.template_service import template_service

router = APIRouter(prefix="/chat", tags=["AI Conversational Drafting"])

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """
    Conversational legal assistant endpoint.
    Accepts user input, active template, and conversation history;
    interviews the user, extracts contractual fields, and updates document preview.
    """
    template = template_service.get_template(request.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id '{request.template_id}' was not found."
        )

    response = await ai_service.process_chat(
        template_id=request.template_id,
        user_message=request.message,
        current_fields=request.current_fields,
        history=request.history
    )
    return response
