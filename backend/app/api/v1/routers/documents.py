import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import Document, User
from backend.app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListItem
from backend.app.services.template_service import template_service
from backend.app.services.pdf_service import pdf_service
from backend.app.api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/documents", tags=["Documents"])

class DirectExportRequest(BaseModel):
    markdown_content: str
    title: str = "Legal Document"
    filename: Optional[str] = None
    party_a_signature: Optional[str] = None
    party_b_signature: Optional[str] = None

@router.get("", response_model=List[DocumentListItem])
async def list_my_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all saved legal agreements belonging to the authenticated user."""
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(desc(Document.updated_at))
    )
    docs = result.scalars().all()
    
    items = []
    for d in docs:
        pct, _, _ = template_service.calculate_completeness(d.template_id, d.field_data or {})
        items.append(
            DocumentListItem(
                id=d.id,
                template_id=d.template_id,
                title=d.title,
                status=d.status,
                completion_percentage=pct,
                created_at=d.created_at,
                updated_at=d.updated_at
            )
        )
    return items

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    doc_in: DocumentCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """
    Save or draft an agreement.
    If authenticated, links document to user account.
    If guest (freemium), creates a standalone draft that can be claimed upon sign-in.
    """
    template = template_service.get_template(doc_in.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with id '{doc_in.template_id}' was not found."
        )

    rendered = template_service.render_document(doc_in.template_id, doc_in.field_data)
    pct, _, _ = template_service.calculate_completeness(doc_in.template_id, doc_in.field_data)
    doc_status = "completed" if pct >= 95.0 else "draft"

    db_doc = Document(
        id=f"doc_{uuid.uuid4().hex[:12]}",
        user_id=current_user.id if current_user else None,
        template_id=doc_in.template_id,
        title=doc_in.title or template.name,
        field_data=doc_in.field_data,
        rendered_content=rendered,
        status=doc_status
    )
    db.add(db_doc)
    await db.commit()
    await db.refresh(db_doc)

    return DocumentResponse(
        id=db_doc.id,
        user_id=db_doc.user_id,
        template_id=db_doc.template_id,
        title=db_doc.title,
        field_data=db_doc.field_data,
        rendered_content=db_doc.rendered_content,
        status=db_doc.status,
        completion_percentage=pct,
        created_at=db_doc.created_at,
        updated_at=db_doc.updated_at
    )

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve document by ID."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    # If document has an owner, verify access
    if doc.user_id is not None and (not current_user or current_user.id != doc.user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this document.")

    pct, _, _ = template_service.calculate_completeness(doc.template_id, doc.field_data or {})
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        template_id=doc.template_id,
        title=doc.title,
        field_data=doc.field_data,
        rendered_content=doc.rendered_content,
        status=doc.status,
        completion_percentage=pct,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    doc_in: DocumentUpdate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Update title, parameters, or status of an existing document."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    if doc.user_id is not None and (not current_user or current_user.id != doc.user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # If document was a guest draft and user is now logged in, claim ownership!
    if doc.user_id is None and current_user:
        doc.user_id = current_user.id

    if doc_in.title is not None:
        doc.title = doc_in.title

    if doc_in.field_data is not None:
        doc.field_data = doc_in.field_data
        doc.rendered_content = template_service.render_document(doc.template_id, doc.field_data)
        pct, _, _ = template_service.calculate_completeness(doc.template_id, doc.field_data)
        doc.status = "completed" if pct >= 95.0 else "draft"

    if doc_in.status is not None:
        doc.status = doc_in.status

    await db.commit()
    await db.refresh(doc)

    pct, _, _ = template_service.calculate_completeness(doc.template_id, doc.field_data or {})
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        template_id=doc.template_id,
        title=doc.title,
        field_data=doc.field_data,
        rendered_content=doc.rendered_content,
        status=doc.status,
        completion_percentage=pct,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a document from the user's vault."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    if doc.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    await db.delete(doc)
    await db.commit()
    return None

@router.get("/{document_id}/pdf")
async def download_document_pdf(
    document_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Generate and stream a publication-ready PDF for the specified saved document."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    content = doc.rendered_content or template_service.render_document(doc.template_id, doc.field_data or {})
    pdf_bytes = pdf_service.generate_pdf(content, document_title=doc.title)
    
    clean_filename = f"{doc.title.lower().replace(' ', '_')}_{doc.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{clean_filename}"'}
    )

@router.post("/export-pdf")
async def export_direct_pdf(request: DirectExportRequest):
    """Generate and stream a legal PDF directly from Markdown content with optional signatures."""
    pdf_bytes = pdf_service.generate_pdf(
        request.markdown_content,
        document_title=request.title,
        party_a_signature=request.party_a_signature,
        party_b_signature=request.party_b_signature
    )
    filename = request.filename or f"{request.title.lower().replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
