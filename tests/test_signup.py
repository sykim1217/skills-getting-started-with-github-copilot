from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_signup_adds_participant():
    resp = client.get("/activities/Programming%20Class")
    assert resp.status_code == 200
    data = resp.json()
    # Make sure a known email is not already present
    email = "testuser@mergington.edu"
    assert email not in [p.lower() for p in data["participants"]]

    # Sign up the new user
    resp = client.post(
        "/activities/Programming%20Class/signup?email=testuser@mergington.edu"
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "Signed up" in body["message"]

    # Confirm participant is present
    resp = client.get("/activities/Programming%20Class")
    assert resp.status_code == 200
    data = resp.json()
    assert "testuser@mergington.edu" in [p.lower() for p in data["participants"]]
