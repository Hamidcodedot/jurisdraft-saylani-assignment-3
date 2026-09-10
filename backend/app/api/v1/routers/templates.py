from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from backend.app.schemas.template import TemplateSummary, TemplateDetail
from backend.app.services.template_service import template_service

router = APIRouter(prefix="/templates", tags=["Templates"])

class RenderRequest(BaseModel):
    field_data: Dict[str, Any] = {}

class RenderResponse(BaseModel):
    rendered_content: str
    completion_percentage: float
    completed_fields: List[str]
    missing_fields: List[str]

@router.get("", response_model=List[TemplateSummary])
async def list_templates():
    """Retrieve catalog of available legal document templates."""
    return template_service.list_templates()

@router.get("/{template_id}", response_model=TemplateDetail)
async def get_template(template_id: str):
    """Retrieve template definition, schema fields, and raw content."""
    template = template_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id '{template_id}' was not found."
        )
    return template

@router.post("/{template_id}/render", response_model=RenderResponse)
async def render_template(template_id: str, request: RenderRequest):
    """Render template with user-supplied fields and return completeness score."""
    template = template_service.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id '{template_id}' was not found."
        )
    rendered = template_service.render_document(template_id, request.field_data)
    pct, completed, missing = template_service.calculate_completeness(template_id, request.field_data)
    return RenderResponse(
        rendered_content=rendered,
        completion_percentage=pct,
        completed_fields=completed,
        missing_fields=missing
    )
