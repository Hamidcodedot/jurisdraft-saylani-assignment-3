import pytest
from backend.app.services.pdf_service import pdf_service

def test_pdf_generation():
    markdown_content = """# MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement is entered into between **Alpha Corp** and **Beta Inc**.

### 1. CONFIDENTIALITY
The parties agree to protect all confidential information with reasonable care.

### SIGNATURES
Party A: Alpha Corp
Party B: Beta Inc
"""
    pdf_bytes = pdf_service.generate_pdf(markdown_content, "Test NDA")
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    # PDF magic header %PDF-
    assert pdf_bytes.startswith(b"%PDF-")
