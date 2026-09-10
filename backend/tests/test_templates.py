import pytest

@pytest.mark.asyncio
async def test_list_templates(client):
    response = await client.get("/api/v1/templates")
    assert response.status_code == 200
    templates = response.json()
    assert len(templates) >= 6
    ids = [t["id"] for t in templates]
    assert "mutual-nda" in ids
    assert "cloud-service-agreement" in ids
    assert "software-license-agreement" in ids
    assert "consulting-agreement" in ids

@pytest.mark.asyncio
async def test_get_template_detail(client):
    response = await client.get("/api/v1/templates/mutual-nda")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "mutual-nda"
    assert len(data["fields"]) > 0
    assert "MUTUAL NON-DISCLOSURE AGREEMENT" in data["raw_content"]

@pytest.mark.asyncio
async def test_render_template(client):
    response = await client.post(
        "/api/v1/templates/mutual-nda/render",
        json={
            "field_data": {
                "party_a_name": "Test Alpha Corp",
                "party_b_name": "Test Beta LLC",
                "governing_jurisdiction": "State of Delaware"
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "Test Alpha Corp" in data["rendered_content"]
    assert "Test Beta LLC" in data["rendered_content"]
    assert data["completion_percentage"] > 0
