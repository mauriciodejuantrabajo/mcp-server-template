import {
  Activity,
  CheckCircle2,
  Clipboard,
  FileCode2,
  FolderPlus,
  Github,
  Loader2,
  Play,
  RefreshCw,
  Rocket,
  Settings2,
  Terminal,
  Wand2,
} from "lucide-react";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8100";

const initialForm = {
  name: "weather-mcp",
  description: "Servidor MCP para consultar clima.",
  target_dir: "C:\\Users\\mauri\\ProyectosPortfolio\\weather-mcp",
  http_port: 8010,
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ children, variant = "primary", className, loading, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        variant === "primary" &&
          "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-110",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700",
        variant === "success" &&
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:brightness-110",
        variant === "dark" &&
          "bg-gradient-to-r from-slate-800 to-slate-950 text-white shadow-md hover:brightness-125",
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      {...props}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      className="min-h-24 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      {...props}
    />
  );
}

function Panel({ title, icon: Icon, children, aside, accent = "indigo" }) {
  const accentStyles = {
    indigo: "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white ring-indigo-200",
    cyan: "bg-gradient-to-br from-cyan-500 to-sky-500 text-white ring-cyan-200",
    emerald: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white ring-emerald-200",
    amber: "bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-amber-200",
    rose: "bg-gradient-to-br from-rose-500 to-pink-500 text-white ring-rose-200",
  };
  const headerTint = {
    indigo: "from-indigo-50",
    cyan: "from-cyan-50",
    emerald: "from-emerald-50",
    amber: "from-amber-50",
    rose: "from-rose-50",
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel transition-shadow hover:shadow-lg">
      <div
        className={cn(
          "flex min-h-16 items-center justify-between border-b border-slate-100 bg-gradient-to-r to-white px-5",
          headerTint[accent],
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className={cn("grid h-9 w-9 place-items-center rounded-lg shadow-sm ring-1", accentStyles[accent])}>
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        </div>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function CodeBlock({ value }) {
  return (
    <pre className="max-h-72 overflow-auto rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-xs leading-5 text-cyan-50 shadow-inner ring-1 ring-inset ring-white/5">
      <code>{value}</code>
    </pre>
  );
}

function Badge({ children, tone = "slate" }) {
  const styles = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-white text-slate-600",
    glass: "border-white/30 bg-white/15 text-white backdrop-blur",
  };
  return (
    <span className={cn("inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-semibold", styles[tone])}>
      {children}
    </span>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="min-w-0 border-b border-slate-100 py-3 last:border-b-0">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [busy, setBusy] = useState("");
  const [echoInput, setEchoInput] = useState("template listo");
  const [echoOutput, setEchoOutput] = useState("");
  const [toolHealth, setToolHealth] = useState("");

  const previewJson = useMemo(() => JSON.stringify(preview ?? { preview: null }, null, 2), [preview]);

  const publishCommands = useMemo(() => {
    const target = preview?.target_dir ?? form.target_dir;
    const repoName = preview?.name ?? form.name;
    return [
      `cd ${target}`,
      "git init",
      "git branch -M main",
      "git add .",
      `git commit -m "Initial ${repoName}"`,
      `git remote add origin https://github.com/USUARIO/${repoName}.git`,
      "git push -u origin main",
    ].join("\n");
  }, [form.name, form.target_dir, preview]);

  function notify(text, tone = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  function validateForm() {
    if (!form.name.trim()) return "El nombre no puede estar vacio.";
    if (!form.target_dir.trim()) return "La carpeta destino no puede estar vacia.";
    const port = Number(form.http_port);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      return "El puerto debe ser un entero entre 1024 y 65535.";
    }
    return null;
  }

  async function request(path, options) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok) {
      // FastAPI devuelve detalle de validacion en 422; lo normalizamos a error.
      const detail =
        (data && (data.detail?.[0]?.msg || data.detail || data.error)) ||
        `HTTP ${response.status}`;
      return { ok: false, error: String(detail) };
    }
    return data ?? {};
  }

  async function refreshHealth() {
    try {
      const data = await request("/api/health");
      setStatus(data.status === "ok" ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }

  async function runPreview(nextForm = form) {
    setBusy("preview");
    setMessage("");
    try {
      const data = await request("/api/preview", {
        method: "POST",
        body: JSON.stringify(nextForm),
      });
      if (data.ok) {
        setPreview(data.preview);
      } else {
        notify(data.error, "error");
      }
    } catch {
      notify("No se pudo conectar con el backend.", "error");
    } finally {
      setBusy("");
    }
  }

  async function createProject() {
    const invalid = validateForm();
    if (invalid) {
      notify(invalid, "error");
      return;
    }
    setBusy("scaffold");
    setMessage("");
    try {
      const data = await request("/api/scaffold", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data.ok) {
        setPreview(data.preview);
        notify(`Creado en ${data.created} (${data.copied_count} archivos).`, "success");
      } else {
        notify(data.error, "error");
      }
    } catch {
      notify("No se pudo crear el proyecto.", "error");
    } finally {
      setBusy("");
    }
  }

  async function runEcho() {
    setBusy("echo");
    try {
      const data = await request("/api/tools/echo", {
        method: "POST",
        body: JSON.stringify({ message: echoInput, uppercase: true }),
      });
      setEchoOutput(data.output ?? data.error ?? "sin salida");
    } catch {
      setEchoOutput("No se pudo conectar con el backend.");
    } finally {
      setBusy("");
    }
  }

  async function runToolHealth() {
    setBusy("tool-health");
    try {
      const data = await request("/api/tools/health-check");
      setToolHealth(data.output ?? data.error ?? "sin salida");
    } catch {
      setToolHealth("No se pudo conectar con el backend.");
    } finally {
      setBusy("");
    }
  }

  async function copyCommand() {
    const command = preview?.commands?.codex ?? "";
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      notify("Comando copiado.", "success");
    } catch {
      notify("No se pudo copiar al portapapeles.", "error");
    }
  }

  function updateField(field, value) {
    const next = {
      ...form,
      [field]: field === "http_port" ? Number(value) : value,
    };
    setForm(next);
  }

  useEffect(() => {
    refreshHealth();
    runPreview(initialForm);
  }, []);

  const steps = [
    ["1", "Configurar", "Nombre, descripcion y destino", "from-indigo-500 to-violet-500"],
    ["2", "Generar", "Crea el server MCP", "from-cyan-500 to-sky-500"],
    ["3", "Publicar", "Git init, remote y push", "from-emerald-500 to-teal-500"],
    ["4", "Probar", "Tools de ejemplo", "from-amber-500 to-orange-500"],
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-cyan-50/30 text-slate-950">
      <div className="relative overflow-hidden border-b border-indigo-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 lg:px-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-white shadow-sm ring-1 ring-white/25 backdrop-blur">
                <Wand2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">MCP Builder</h1>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <Badge tone="glass">React</Badge>
                  <Badge tone="glass">Tailwind</Badge>
                  <Badge tone="glass">FastAPI</Badge>
                  <Badge tone="glass">FastMCP</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold backdrop-blur",
                  status === "online"
                    ? "border-emerald-300/50 bg-emerald-400/20 text-white"
                    : status === "offline"
                      ? "border-rose-300/50 bg-rose-400/20 text-white"
                      : "border-amber-300/50 bg-amber-400/20 text-white",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", status === "online" ? "bg-emerald-300" : status === "offline" ? "bg-rose-300" : "bg-amber-300")} />
                {status}
              </span>
              <button
                onClick={refreshHealth}
                title="Actualizar estado"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="grid gap-3 text-sm md:grid-cols-4">
            {steps.map(([step, title, text, grad]) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur transition hover:bg-white/15"
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm", grad)}>
                  {step}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-white">{title}</div>
                  <div className="truncate text-xs text-indigo-100">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:px-6">
        <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          <Panel title="Blueprint" icon={Settings2} accent="indigo">
            <div className="grid gap-4">
              <Field label="Nombre">
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              </Field>
              <Field label="Descripcion">
                <Textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
              </Field>
              <Field label="Carpeta destino">
                <Input value={form.target_dir} onChange={(event) => updateField("target_dir", event.target.value)} />
              </Field>
              <Field label="Puerto HTTP">
                <Input type="number" min="1024" max="65535" value={form.http_port} onChange={(event) => updateField("http_port", event.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button variant="secondary" onClick={() => runPreview()} loading={busy === "preview"}>
                  <Play className="h-4 w-4" />
                  Preview
                </Button>
                <Button variant="success" onClick={createProject} loading={busy === "scaffold"}>
                  <FolderPlus className="h-4 w-4" />
                  Crear
                </Button>
              </div>
              {message ? (
                <div
                  role="status"
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium shadow-sm",
                    messageTone === "error" && "border-rose-200 bg-rose-50 text-rose-900",
                    messageTone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
                    messageTone === "info" && "border-indigo-200 bg-indigo-50 text-indigo-900",
                  )}
                >
                  {message}
                </div>
              ) : null}
            </div>
          </Panel>

          <div className="grid gap-5">
            <Panel
              title="Salida"
              icon={FileCode2}
              accent="emerald"
              aside={
                <Button variant="secondary" onClick={copyCommand} title="Copiar comando Codex">
                  <Clipboard className="h-4 w-4" />
                </Button>
              }
            >
              <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
                <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white px-4 shadow-sm">
                  <SummaryItem label="Servidor" value={preview?.name ?? form.name} />
                  <SummaryItem label="Destino" value={preview?.target_dir ?? form.target_dir} />
                  <SummaryItem label="Puerto HTTP" value={preview?.http_port ?? form.http_port} />
                  <SummaryItem label="Archivos base" value={`${preview?.files?.length ?? 8} archivos`} />
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Registrar en Codex
                    </div>
                    <CodeBlock value={preview?.commands?.codex ?? "codex mcp add ..."} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Github className="h-4 w-4 text-slate-700" />
                      Formato para subirlo a GitHub
                    </div>
                    <CodeBlock value={publishCommands} />
                  </div>
                </div>
              </div>
            </Panel>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Panel title="Preview JSON" icon={Terminal} accent="amber">
                <CodeBlock value={previewJson} />
              </Panel>

              <Panel title="Probar Tools" icon={Rocket} accent="rose">
                <div className="grid gap-4">
                  <div className="grid gap-3 border-b border-slate-100 pb-4">
                    <Field label="echo">
                      <Input value={echoInput} onChange={(event) => setEchoInput(event.target.value)} />
                    </Field>
                    <Button variant="secondary" onClick={runEcho} loading={busy === "echo"}>
                      <Play className="h-4 w-4" />
                      Ejecutar
                    </Button>
                    <CodeBlock value={echoOutput || "sin salida"} />
                  </div>
                  <div className="grid gap-3">
                    <Button variant="dark" onClick={runToolHealth} loading={busy === "tool-health"}>
                      <Activity className="h-4 w-4" />
                      Health Check
                    </Button>
                    <CodeBlock value={toolHealth || "sin salida"} />
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
