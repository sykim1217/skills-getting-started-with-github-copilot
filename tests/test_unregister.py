from fastapi.testclient import TestClient
from src.app import app


client = TestClient(app)


def test_unregister_participant():
    # Ensure the participant exists first
    resp = client.get("/activities/Chess%20Club")
    assert resp.status_code == 200
    data = resp.json()
    assert "michael@mergington.edu" in [p.lower() for p in data["participants"]]

    # Unregister the participant
    resp = client.delete(
        "/activities/Chess%20Club/participants?email=michael@mergington.edu"
    )
    assert resp.status_code == 200
    json_data = resp.json()
    assert "Unregistered" in json_data["message"]

    # Verify the participant is removed
    resp = client.get("/activities/Chess%20Club")
    assert resp.status_code == 200
    data = resp.json()
    assert "michael@mergington.edu" not in [p.lower() for p in data["participants"]]
