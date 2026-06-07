from __future__ import annotations

import pytest
from mcp.shared.memory import create_connected_server_and_client_session

from src.server import mcp


def _text(result) -> str:
    parts = [content.text for content in result.content if getattr(content, "type", None) == "text"]
    return "\n".join(parts)


@pytest.mark.asyncio
async def test_lista_las_tools_del_template():
    async with create_connected_server_and_client_session(mcp._mcp_server) as client:
        await client.initialize()
        tools = (await client.list_tools()).tools
        names = {tool.name for tool in tools}
        assert names == {"echo", "health_check"}
        for tool in tools:
            assert tool.description
            assert tool.inputSchema


@pytest.mark.asyncio
async def test_echo_por_mcp():
    async with create_connected_server_and_client_session(mcp._mcp_server) as client:
        await client.initialize()
        result = await client.call_tool(
            "echo",
            {"message": "template listo", "uppercase": True},
        )
        assert _text(result) == "TEMPLATE LISTO"


@pytest.mark.asyncio
async def test_health_check_por_mcp():
    async with create_connected_server_and_client_session(mcp._mcp_server) as client:
        await client.initialize()
        result = await client.call_tool("health_check", {})
        out = _text(result)
        assert "service: mcp-server-template" in out
        assert "status: ok" in out
        assert "version: 0.1.0" in out

