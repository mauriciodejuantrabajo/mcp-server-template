> **Idioma / Language:** **English** · [Español](README.es.md)

# mcp-server-template

Minimal template to build **MCP (Model Context Protocol)** servers in Python
using the official SDK and `FastMCP`.

The idea is that you can copy this repo, change the server name, replace the
example tools with real ones, and have MCP integration tests from the very first
commit.

## Guided interface

### Visual app

It also includes a local graphical interface to work with the template:

```bash
# Terminal 1: backend
uvicorn src.builder_api:app --host 127.0.0.1 --port 8100

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. From there you can configure the name, description,
target folder and port, preview files/commands, generate a project, and test the
example tools.

#### The UI shows `offline` / "No se pudo conectar con el backend"

That message means the browser's `fetch` to the backend failed. Almost always
the backend is fine and the cause is on the browser side. To diagnose it:

1. Make sure the backend is running and responds. In another terminal:

   ```bash
   curl http://127.0.0.1:8100/api/health
   ```

   It should return `{"status":"ok","service":"mcp-template-builder"}`. If it
   doesn't respond, start the backend (Terminal 1 above).

2. Open `http://127.0.0.1:8100/api/health` directly in a new browser tab:
   - **If you see the JSON** → the browser reaches the backend; the block comes
     from an extension (ad-block/privacy) or from cache. Open the app in an
     incognito window (`Ctrl+Shift+N`); if it connects there, it was an
     extension. A hard reload with `Ctrl+Shift+R` also helps.
   - **If it doesn't load** → it's a firewall or local network issue; the
     browser can't reach port 8100.

3. Make sure you open the app at `http://127.0.0.1:5173`. If port 5173 was busy,
   Vite jumps to 5174/5175 and you must use that port (the backend already
   accepts any `localhost`/`127.0.0.1` port via CORS).

4. Click the refresh button (icon at the top right, next to the status) to retry
   the health check without reloading the page.

### CLI

The recommended path is to use the template wizard. It asks what's needed and
creates a new, already-renamed folder:

```bash
python scripts/scaffold.py
```

You can also use it without prompts, useful for automation:

```bash
python scripts/scaffold.py --no-input ^
  --name weather-mcp ^
  --target ..\weather-mcp ^
  --description "MCP server to query the weather." ^
  --port 8010
```

When it finishes it prints the next steps: create an environment, install
dependencies, run the tests, and register the server in Codex.

## What it includes

| Piece | What it's for |
|-------|---------------|
| `src/server.py` | Defines the FastMCP server, registers tools and supports `stdio`/HTTP |
| `src/tools/example.py` | Pure tool logic, testable without MCP |
| `scripts/scaffold.py` | Guided interface to generate a new MCP from this template |
| `tests/test_server_mcp.py` | Tests using the real MCP protocol in memory |
| `examples/claude_desktop_config.json` | Base config for Claude Desktop |
| `.env.example` | Server environment variables |

## Included tools

| Tool | What it does |
|------|--------------|
| `echo` | Returns a message; useful to test simple inputs |
| `health_check` | Returns the server name, version and status |

## Create a new server manually

If you prefer to do it by hand, copy the repo and change the name:

```bash
cp -r mcp-server-template my-mcp-server
cd my-mcp-server
```

Change the visible name in `.env`:

```bash
copy .env.example .env
```

```env
MCP_SERVER_NAME=my-mcp-server
MCP_SERVER_VERSION=0.1.0
```

Replace `src/tools/example.py` with your domain logic.

Register your tools in `src/server.py` using:

```python
@mcp.tool(description="Short description of the tool.")
def my_tool(argument: str) -> str:
    return "result"
```

Update the tests and run:

```bash
pytest
```

## Installation

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Test with MCP Inspector

```bash
mcp dev src/server.py
```

Test `echo` with:

```json
{
  "message": "hello MCP",
  "uppercase": true
}
```

## Claude Desktop

Use [examples/claude_desktop_config.json](examples/claude_desktop_config.json)
and adjust the absolute path:

```json
{
  "mcpServers": {
    "template": {
      "command": "python",
      "args": ["-m", "src.server"],
      "cwd": "C:\\path\\to\\mcp-server-template"
    }
  }
}
```

## Codex CLI

To register this server in Codex:

```bash
codex mcp add template -- python C:\path\to\mcp-server-template\run_server.py
```

Then restart Codex and try:

```text
Use the template MCP and call health_check
```

## Transports

```bash
python -m src.server          # stdio
python -m src.server --http   # Streamable HTTP on 127.0.0.1:8002
```

## Tests

```bash
pytest
```

The tests use no network and no credentials.
