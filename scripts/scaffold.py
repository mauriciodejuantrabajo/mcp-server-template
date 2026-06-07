from __future__ import annotations

import argparse
import os
import re
import shutil
from dataclasses import dataclass
from pathlib import Path


TEMPLATE_NAME = "mcp-server-template"
DEFAULT_DESCRIPTION = "Servidor MCP creado desde mcp-server-template."
SKIP_DIRS = {
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    "node_modules",
    "dist",
    ".vite",
    ".idea",
    ".vscode",
}
SKIP_FILES = {".env"}
TEXT_EXTENSIONS = {
    ".json",
    ".md",
    ".py",
    ".txt",
    ".toml",
    ".ini",
    ".example",
}


@dataclass(frozen=True)
class ScaffoldConfig:
    name: str
    target_dir: Path
    description: str = DEFAULT_DESCRIPTION
    http_port: int = 8002


class ScaffoldError(Exception):
    """Raised when the wizard cannot create a new server."""


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9-]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    if not value:
        raise ScaffoldError("El nombre del servidor no puede estar vacio.")
    return value


def _template_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _is_text_file(path: Path) -> bool:
    if path.name in {".gitignore", ".env.example"}:
        return True
    return path.suffix in TEXT_EXTENSIONS


def _replace_text(path: Path, config: ScaffoldConfig) -> None:
    if not _is_text_file(path):
        return
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        # No es texto UTF-8 valido (o no se pudo leer): se deja tal cual.
        return
    text = text.replace(TEMPLATE_NAME, config.name)
    text = text.replace("Template de servidor MCP.", f"Servidor MCP: {config.name}.")
    text = text.replace("Template minimo para crear servidores MCP", config.description)
    text = text.replace("Plantilla minima para crear servidores", config.description)
    text = text.replace("8002", str(config.http_port))
    path.write_text(text, encoding="utf-8")


def scaffold_project(config: ScaffoldConfig, template_root: Path | None = None) -> list[str]:
    template_root = template_root or _template_root()
    template_root = template_root.resolve()
    target_dir = config.target_dir.resolve()

    if target_dir == template_root or template_root in target_dir.parents:
        raise ScaffoldError("El destino debe estar fuera de la carpeta del template.")
    if target_dir.exists() and any(target_dir.iterdir()):
        raise ScaffoldError(f"El destino ya existe y no esta vacio: {target_dir}")

    target_dir.mkdir(parents=True, exist_ok=True)

    copied: list[str] = []
    for source in _iter_template_files(template_root):
        relative = source.relative_to(template_root)
        destination = target_dir / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        _replace_text(destination, config)
        copied.append(str(relative))

    return copied


def _iter_template_files(template_root: Path):
    """Recorre el template podando los directorios pesados (node_modules, etc.).

    Usa os.walk para no descender en absoluto en las carpetas a saltar, en vez
    de iterar miles de archivos y descartarlos uno por uno.
    """
    for dirpath, dirnames, filenames in os.walk(template_root):
        # Poda in-place: os.walk no entra en los directorios removidos.
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            if filename in SKIP_FILES:
                continue
            yield Path(dirpath) / filename


def _ask(prompt: str, default: str) -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{prompt}{suffix}: ").strip()
    return value or default


def interactive_config() -> ScaffoldConfig:
    print("Crear nuevo servidor MCP")
    print("------------------------")
    name = slugify(_ask("Nombre del servidor", "my-mcp-server"))
    description = _ask("Descripcion corta", DEFAULT_DESCRIPTION)
    default_target = str(_template_root().parent / name)
    target_dir = Path(_ask("Carpeta destino", default_target))
    port_text = _ask("Puerto HTTP local", "8002")
    try:
        http_port = int(port_text)
    except ValueError as exc:
        raise ScaffoldError("El puerto debe ser un numero.") from exc
    return ScaffoldConfig(
        name=name,
        target_dir=target_dir,
        description=description,
        http_port=http_port,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Interfaz guiada para crear un servidor MCP desde este template."
    )
    parser.add_argument("--name", help="Nombre slug del nuevo servidor, por ejemplo weather-mcp.")
    parser.add_argument("--target", help="Carpeta destino del nuevo servidor.")
    parser.add_argument("--description", default=DEFAULT_DESCRIPTION)
    parser.add_argument("--port", type=int, default=8002, help="Puerto para modo HTTP.")
    parser.add_argument(
        "--no-input",
        action="store_true",
        help="Modo no interactivo; requiere --name y --target.",
    )
    return parser.parse_args(argv)


def build_config(args: argparse.Namespace) -> ScaffoldConfig:
    if not args.no_input:
        return interactive_config()
    if not args.name or not args.target:
        raise ScaffoldError("--no-input requiere --name y --target.")
    return ScaffoldConfig(
        name=slugify(args.name),
        target_dir=Path(args.target),
        description=args.description,
        http_port=args.port,
    )


def main(argv: list[str] | None = None) -> None:
    try:
        config = build_config(parse_args(argv))
        copied = scaffold_project(config)
    except ScaffoldError as exc:
        raise SystemExit(f"Error: {exc}") from exc

    print()
    print(f"Servidor creado: {config.target_dir}")
    print(f"Archivos copiados: {len(copied)}")
    print()
    print("Siguientes pasos:")
    print(f"  cd {config.target_dir}")
    print("  python -m venv .venv")
    print("  .venv\\Scripts\\activate")
    print("  pip install -r requirements.txt")
    print("  python -m pytest")
    print(f"  codex mcp add {config.name} -- python {config.target_dir / 'run_server.py'}")


if __name__ == "__main__":
    main()

