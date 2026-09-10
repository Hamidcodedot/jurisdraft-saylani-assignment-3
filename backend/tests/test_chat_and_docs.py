import pytest

@pytest.mark.asyncio
async def test_chat_extraction_and_drafting(client):
    # Chat message with entity values
    response = await client.post(
        "/api/v1/chat/message",
        json={
            "template_id": "mutual-nda",
            "message": "Party A is Acme Dynamics Inc. and Party B is Beacon Capital LLC. The governing jurisdiction is Delaware.",
            "current_fields": {},
            "history": []
        }
    )
    assert response.status_code == 200
    data = response.json()
    all_values_str = str(list(data["all_fields"].values()))
    assert "Acme Dynamics" in all_values_str
    assert "Beacon Capital" in all_values_str
    assert "Delaware" in all_values_str
    assert data["completion_percentage"] > 0
    assert "Acme Dynamics" in data["rendered_content"]

@pytest.mark.asyncio
async def test_document_crud_and_freemium(client):
    # 1. Anonymous guest draft creation
    create_resp = await client.post(
        "/api/v1/documents",
        json={
            "template_id": "mutual-nda",
            "title": "Guest Mutual NDA Draft",
            "field_data": {
                "party_a_name": "Freelancer John",
                "party_b_name": "Startup Tech"
            }
        }
    )
    assert create_resp.status_code == 201
    doc = create_resp.json()
    assert doc["title"] == "Guest Mutual NDA Draft"
    doc_id = doc["id"]

    # 2. Retrieve guest draft
    get_resp = await client.get(f"/api/v1/documents/{doc_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == doc_id

    # 3. Download PDF of guest draft
    pdf_resp = await client.get(f"/api/v1/documents/{doc_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000
