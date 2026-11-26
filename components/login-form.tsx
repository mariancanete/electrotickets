"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Textos de error del login. El servidor devuelve solo un `code`; el texto se elige acá, sin
 * detalles técnicos (nada de "variable de entorno").
 */
function errorMessage(code: string | undefined, retryAfter?: number) {
  if (code === "throttled") {
    const minutes = Math.max(1, Math.ceil((retryAfter ?? 60) / 60));
    return `Demasiados intentos. Esperá ${minutes} ${minutes === 1 ? "minuto" : "minutos"} y probá de nuevo.`;
  }
  if (code === "not_configured") return "El panel todavía no está listo para entrar. Revisá la configuración en Vercel.";
  if (code === "invalid") return "Contraseña incorrecta.";
  return "No pudimos conectar. Probá de nuevo.";
}

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string; retryAfter?: number };
        setError(errorMessage(data.error, data.retryAfter));
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(errorMessage(undefined));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto max-w-md rounded-[20px] p-6">
      <h1 className="text-3xl font-black">Admin ElectroTickets</h1>
      <p className="mt-2 text-sm text-white/62">Entrá para cargar fechas desde tu celular o PC.</p>
      {/* `for`/`id`, `name` y `autocomplete="current-password"`: así el gestor de contraseñas
          del celular ofrece guardarla y la completa la próxima vez. */}
      <label htmlFor="admin-password" className="mt-6 block text-sm font-semibold text-white/78">
        Contraseña
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        enterKeyHint="done"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "admin-login-error" : undefined}
        className="mt-2 w-full rounded-[12px] border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-white/35"
        placeholder="Tu contraseña admin"
        required
      />
      {error ? (
        <p id="admin-login-error" role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85 disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Ingresar"}
      </button>
    </form>
  );
}
