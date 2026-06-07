from __future__ import annotations

from src.tools.example import ExampleToolError, echo, health_check


def test_echo_devuelve_mensaje():
    assert echo("hola mundo") == "hola mundo"


def test_echo_uppercase():
    assert echo("hola mundo", uppercase=True) == "HOLA MUNDO"


def test_echo_rechaza_mensaje_vacio():
    try:
        echo("   ")
    except ExampleToolError as exc:
        assert "message" in str(exc)
    else:
        raise AssertionError("echo debio rechazar mensajes vacios")


def test_health_check():
    out = health_check("demo-server", "1.2.3")
    assert "service: demo-server" in out
    assert "status: ok" in out
    assert "version: 1.2.3" in out

