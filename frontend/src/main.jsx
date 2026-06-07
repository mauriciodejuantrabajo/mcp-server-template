import * as React from "react";
import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

function FatalError({ error }) {
  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-rose-200 bg-white p-5 shadow-panel">
        <h1 className="text-xl font-semibold">MCP Builder no pudo cargar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Revisa la consola del navegador o reinicia el servidor de Vite.
        </p>
        <pre className="mt-4 overflow-auto rounded-md bg-rose-950 p-3 text-xs text-rose-50">
          {String(error?.message ?? error)}
        </pre>
      </section>
    </main>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <FatalError error={this.state.error} />;
    }
    return this.props.children;
  }
}

try {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  createRoot(document.getElementById("root")).render(<FatalError error={error} />);
}
