from __future__ import annotations

from dataclasses import dataclass


class ExampleToolError(Exception):
    """Raised when an example tool receives invalid input."""


@dataclass(frozen=True)
class HealthStatus:
    service: str
    status: str
    version: str

    def as_text(self) -> str:
        return "\n".join(
            [
                f"service: {self.service}",
                f"status: {self.status}",
                f"version: {self.version}",
            ]
        )


def echo(message: str, uppercase: bool = False) -> str:
    """Return the message back to the caller."""
    message = message.strip()
    if not message:
        raise ExampleToolError("message es obligatorio.")
    if uppercase:
        return message.upper()
    return message


def health_check(service_name: str, version: str) -> str:
    """Return a small status payload for smoke tests."""
    service_name = service_name.strip()
    version = version.strip()
    if not service_name:
        raise ExampleToolError("service_name no puede estar vacio.")
    if not version:
        raise ExampleToolError("version no puede estar vacia.")
    return HealthStatus(service=service_name, status="ok", version=version).as_text()

