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

def test_pdf_with_signatures_and_page_break():
    # 1x1 transparent png in base64
    dummy_sig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    markdown_content = """# MUTUAL NON-DISCLOSURE AGREEMENT
    
Page 1 intro.
<!-- pagebreak -->
## SECTION 2: EXECUTION
PARTY A: Alpha Corp
By: ______________________
PARTY B: Beta Inc
By: ______________________
"""
    pdf_bytes = pdf_service.generate_pdf(
        markdown_content,
        "Test NDA with Signatures",
        party_a_signature=dummy_sig,
        party_b_signature=dummy_sig
    )
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF-")

