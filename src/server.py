"""
Template minimo para crear servidores MCP con FastMCP.

Ejecutar:
    python -m src.server
o por HTTP:
    python -m src.server --http
"""

from __future__ import annotations

import argparse
import os

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from .tools.example import ExampleToolError, echo as _echo
from .tools.example import health_check as _health_check

load_dotenv()

SERVER_NAME = os.getenv("MCP_SERVER_NAME", "mcp-server-template")
SERVER_VERSION = os.getenv("MCP_SERVER_VERSION", "0.1.0")

mcp = FastMCP(
    SERVER_NAME,
    instructions=(
        "Plantilla base para construir servidores MCP en Python con FastMCP. "
        "Reemplaza las tools de ejemplo por capacidades reales del dominio."
    ),
)


@mcp.tool(description="Devuelve el mensaje recibido. Sirve como ejemplo de tool simple.")
def echo(message: str, uppercase: bool = False) -> str:
    """Devuelve `message`; si `uppercase` es true, lo transforma a mayusculas."""
    try:
        return _echo(message, uppercase)
    except ExampleToolError as exc:
        return f"Error: {exc}"


@mcp.tool(description="Devuelve estado basico del servidor MCP.")
def health_check() -> str:
    """Devuelve nombre, estado y version del servidor."""
    try:
        return _health_check(SERVER_NAME, SERVER_VERSION)
    except ExampleToolError as exc:
        return f"Error: {exc}"


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Template de servidor MCP.")
    parser.add_argument(
        "--http",
        action="store_true",
        help="Servir por Streamable HTTP en vez de stdio.",
    )
    args = parser.parse_args(argv)

    if args.http:
        os.environ.setdefault("FASTMCP_HOST", "127.0.0.1")
        os.environ.setdefault("FASTMCP_PORT", "8002")
        mcp.run(transport="streamable-http")
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()

