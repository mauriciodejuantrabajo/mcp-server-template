from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from src.builder_api import app


client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_preview_normaliza_nombre(tmp_path):
    response = client.post(
        "/api/preview",
        json={
            "name": " Weather MCP ",
            "target_dir": str(tmp_path / "weather-mcp"),
            "description": "Servidor de clima",
            "http_port": 8010,
        },
    )
    body = response.json()
    assert body["ok"] is True
    assert body["preview"]["name"] == "weather-mcp"
    assert body["preview"]["http_port"] == 8010
    assert "codex mcp add weather-mcp" in body["preview"]["commands"]["codex"]


def test_scaffold_crea_proyecto(tmp_path):
    target = tmp_path / "demo-mcp"
    response = client.post(
        "/api/scaffold",
        json={
            "name": "demo-mcp",
            "target_dir": str(target),
            "description": "Demo visual",
            "http_port": 8020,
        },
    )
    body = response.json()
    assert body["ok"] is True
    assert body["copied_count"] > 0
    assert Path(body["created"]).exists()
    assert (target / "README.md").exists()


def test_echo_tool_api():
    response = client.post(
        "/api/tools/echo",
        json={"message": "hola builder", "uppercase": True},
    )
    assert response.json() == {"ok": True, "output": "HOLA BUILDER"}

