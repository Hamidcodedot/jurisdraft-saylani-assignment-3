import pytest

@pytest.mark.asyncio
async def test_auth_flow(client):
    # 1. Sign up new user
    signup_resp = await client.post(
        "/api/v1/auth/signup",
        json={
            "email": "attorney@example.com",
            "password": "SecurePassword123!",
            "full_name": "Counsel Jane Doe",
            "company_name": "Lex Global Advisory"
        }
    )
    assert signup_resp.status_code == 201
    signup_data = signup_resp.json()
    assert "access_token" in signup_data
    assert signup_data["user"]["email"] == "attorney@example.com"
    token = signup_data["access_token"]

    # 2. Get profile with JWT
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["full_name"] == "Counsel Jane Doe"

    # 3. Login with correct credentials
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "attorney@example.com",
            "password": "SecurePassword123!"
        }
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 4. Login with invalid password
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "attorney@example.com",
            "password": "WrongPassword!"
        }
    )
    assert bad_login.status_code == 401
