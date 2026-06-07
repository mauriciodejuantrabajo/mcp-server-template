# mcp-server-template

Plantilla minima para crear servidores **MCP (Model Context Protocol)** en Python
con el SDK oficial y `FastMCP`.

La idea es que puedas copiar este repo, cambiar el nombre del servidor, reemplazar
las tools de ejemplo por tools reales y tener tests de integracion MCP desde el
primer commit.

## Interfaz guiada

### App visual

Tambien incluye una interfaz grafica local para trabajar con la plantilla:

```bash
# Terminal 1: backend
uvicorn src.builder_api:app --host 127.0.0.1 --port 8100

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

Abre `http://127.0.0.1:5173`. Desde ahi puedes configurar nombre, descripcion,
carpeta destino y puerto, ver preview de archivos/comandos, generar un proyecto y
probar las tools de ejemplo.

#### La UI aparece `offline` / "No se pudo conectar con el backend"

Ese mensaje significa que el `fetch` del navegador hacia el backend fallo. Casi
siempre el backend esta bien y la causa es del lado del navegador. Para
diagnosticarlo:

1. Verifica que el backend este corriendo y responda. En otra terminal:

   ```bash
   curl http://127.0.0.1:8100/api/health
   ```

   Debe devolver `{"status":"ok","service":"mcp-template-builder"}`. Si no
   responde, arranca el backend (Terminal 1 de arriba).

2. Abre `http://127.0.0.1:8100/api/health` directamente en una pestana nueva del
   navegador:
   - **Si ves el JSON** → el navegador llega al backend; el bloqueo viene de una
     extension (adblock/privacy) o de cache. Abre la app en una ventana de
     incognito (`Ctrl+Shift+N`); si ahi conecta, era una extension. Tambien
     ayuda una recarga forzada con `Ctrl+Shift+R`.
   - **Si no carga** → es firewall o red local; el navegador no alcanza el 8100.

3. Asegurate de abrir la app en `http://127.0.0.1:5173`. Si el puerto 5173
   estaba ocupado, Vite salta a 5174/5175 y debes usar ese puerto (el backend ya
   acepta cualquier puerto de `localhost`/`127.0.0.1` via CORS).

4. Pulsa el boton de refrescar (icono arriba a la derecha, junto al estado) para
   reintentar el chequeo de salud sin recargar la pagina.

### CLI

El camino recomendado es usar el wizard del template. Te pregunta lo necesario y
crea una carpeta nueva ya renombrada:

```bash
python scripts/scaffold.py
```

Tambien puedes usarlo sin preguntas, util para automatizar:

```bash
python scripts/scaffold.py --no-input ^
  --name weather-mcp ^
  --target ..\weather-mcp ^
  --description "Servidor MCP para consultar clima." ^
  --port 8010
```

Al terminar imprime los siguientes pasos: crear entorno, instalar dependencias,
correr tests y registrar el servidor en Codex.

## Que trae

| Pieza | Para que sirve |
|-------|----------------|
| `src/server.py` | Define el servidor FastMCP, registra tools y soporta `stdio`/HTTP |
| `src/tools/example.py` | Logica pura de tools, testeable sin MCP |
| `scripts/scaffold.py` | Interfaz guiada para generar un MCP nuevo desde esta plantilla |
| `tests/test_server_mcp.py` | Tests usando el protocolo MCP real en memoria |
| `examples/claude_desktop_config.json` | Config base para Claude Desktop |
| `.env.example` | Variables de entorno del servidor |

## Tools incluidas

| Tool | Que hace |
|------|----------|
| `echo` | Devuelve un mensaje; sirve para probar inputs simples |
| `health_check` | Devuelve nombre, version y estado del servidor |

## Crear un servidor nuevo manualmente

Si prefieres hacerlo a mano, copia el repo y cambia el nombre:

```bash
cp -r mcp-server-template mi-mcp-server
cd mi-mcp-server
```

Cambia el nombre visible en `.env`:

```bash
copy .env.example .env
```

```env
MCP_SERVER_NAME=mi-mcp-server
MCP_SERVER_VERSION=0.1.0
```

Reemplaza `src/tools/example.py` por la logica de tu dominio.

Registra tus tools en `src/server.py` usando:

```python
@mcp.tool(description="Descripcion corta de la tool.")
def mi_tool(argumento: str) -> str:
    return "resultado"
```

Actualiza los tests y corre:

```bash
pytest
```

## Instalacion

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Probar con MCP Inspector

```bash
mcp dev src/server.py
```

Prueba `echo` con:

```json
{
  "message": "hola MCP",
  "uppercase": true
}
```

## Claude Desktop

Usa [examples/claude_desktop_config.json](examples/claude_desktop_config.json) y
ajusta la ruta absoluta:

```json
{
  "mcpServers": {
    "template": {
      "command": "python",
      "args": ["-m", "src.server"],
      "cwd": "C:\\ruta\\a\\mcp-server-template"
    }
  }
}
```

## Codex CLI

Para registrar este servidor en Codex:

```bash
codex mcp add template -- python C:\ruta\a\mcp-server-template\run_server.py
```

Luego reinicia Codex y prueba:

```text
Usa el MCP template y llama health_check
```

## Transportes

```bash
python -m src.server          # stdio
python -m src.server --http   # Streamable HTTP en 127.0.0.1:8002
```

## Tests

```bash
pytest
```

Los tests no usan red ni credenciales.
