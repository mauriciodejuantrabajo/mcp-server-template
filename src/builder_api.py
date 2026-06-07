from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from scripts.scaffold import DEFAULT_DESCRIPTION, ScaffoldConfig, ScaffoldError
from scripts.scaffold import scaffold_project, slugify
from src.tools.example import echo, health_check


class BuilderRequest(BaseModel):
    name: Annotated[str, Field(min_length=1)]
    target_dir: Annotated[str, Field(min_length=1)]
    description: str = DEFAULT_DESCRIPTION
    http_port: Annotated[int, Field(ge=1024, le=65535)] = 8002


class EchoRequest(BaseModel):
    message: str
    uppercase: bool = False


def _config_from_request(request: BuilderRequest) -> ScaffoldConfig:
    return ScaffoldConfig(
        name=slugify(request.name),
        target_dir=Path(request.target_dir),
        description=request.description.strip() or DEFAULT_DESCRIPTION,
        http_port=request.http_port,
    )


def _codex_command(config: ScaffoldConfig) -> str:
    return f"codex mcp add {config.name} -- python {config.target_dir / 'run_server.py'}"


def _preview_payload(config: ScaffoldConfig) -> dict[str, object]:
    return {
        "name": config.name,
        "target_dir": str(config.target_dir),
        "description": config.description,
        "http_port": config.http_port,
        "files": [
            "README.md",
            ".env.example",
            "requirements.txt",
            "run_server.py",
            "src/server.py",
            "src/tools/example.py",
            "tests/test_server_mcp.py",
            "examples/claude_desktop_config.json",
        ],
        "commands": {
            "install": "pip install -r requirements.txt",
            "test": "python -m pytest",
            "serve_stdio": "python -m src.server",
            "serve_http": "python -m src.server --http",
            "codex": _codex_command(config),
        },
    }


app = FastAPI(title="MCP Server Template Builder", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    # Acepta cualquier puerto de localhost/127.0.0.1 para que el preflight no
    # falle cuando Vite salta de puerto (5173 -> 5174 -> ...).
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return {"status": "ok", "service": "mcp-template-builder"}


@app.post("/api/preview")
def preview(request: BuilderRequest) -> dict[str, object]:
    try:
        config = _config_from_request(request)
        return {"ok": True, "preview": _preview_payload(config)}
    except ScaffoldError as exc:
        return {"ok": False, "error": str(exc)}
    except Exception as exc:  # noqa: BLE001 - nunca devolver 500 a la UI
        return {"ok": False, "error": f"Error inesperado: {exc}"}


@app.post("/api/scaffold")
def scaffold(request: BuilderRequest) -> dict[str, object]:
    try:
        config = _config_from_request(request)
        copied = scaffold_project(config)
        return {
            "ok": True,
            "created": str(config.target_dir),
            "copied_count": len(copied),
            "preview": _preview_payload(config),
        }
    except ScaffoldError as exc:
        return {"ok": False, "error": str(exc)}
    except OSError as exc:
        return {"ok": False, "error": f"No se pudo escribir en el destino: {exc}"}
    except Exception as exc:  # noqa: BLE001 - nunca devolver 500 a la UI
        return {"ok": False, "error": f"Error inesperado al generar: {exc}"}


@app.post("/api/tools/echo")
def api_echo(request: EchoRequest) -> dict[str, object]:
    try:
        return {"ok": True, "output": echo(request.message, request.uppercase)}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc)}


@app.get("/api/tools/health-check")
def api_health_check() -> dict[str, object]:
    return {"ok": True, "output": health_check("mcp-server-template", "0.1.0")}

