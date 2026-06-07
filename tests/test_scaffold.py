from __future__ import annotations

from pathlib import Path

import pytest

from scripts.scaffold import ScaffoldConfig, ScaffoldError, scaffold_project, slugify


def test_slugify_normaliza_nombre():
    assert slugify(" Mi MCP Server!! ") == "mi-mcp-server"


def test_slugify_rechaza_vacio():
    with pytest.raises(ScaffoldError):
        slugify("!!!")


def test_scaffold_project_crea_copia_renombrada(tmp_path):
    target = tmp_path / "weather-mcp"
    copied = scaffold_project(
        ScaffoldConfig(
            name="weather-mcp",
            target_dir=target,
            description="Servidor MCP para clima.",
            http_port=8010,
        )
    )

    assert "src/server.py" in {item.replace("\\", "/") for item in copied}
    assert (target / "README.md").exists()
    assert (target / "src" / "server.py").exists()
    assert not list(target.rglob("__pycache__"))
    assert not (target / ".env").exists()

    readme = (target / "README.md").read_text(encoding="utf-8")
    server = (target / "src" / "server.py").read_text(encoding="utf-8")
    env_example = (target / ".env.example").read_text(encoding="utf-8")

    assert "# weather-mcp" in readme
    assert "Servidor MCP para clima." in readme
    assert "SERVER_NAME = os.getenv(\"MCP_SERVER_NAME\", \"weather-mcp\")" in server
    assert '"weather-mcp"' in server
    assert '"8010"' in server
    assert "MCP_SERVER_NAME=weather-mcp" in env_example


def test_scaffold_project_rechaza_destino_no_vacio(tmp_path):
    target = tmp_path / "existing"
    target.mkdir()
    (target / "file.txt").write_text("ocupado", encoding="utf-8")

    with pytest.raises(ScaffoldError):
        scaffold_project(ScaffoldConfig(name="demo", target_dir=target))

