"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Contraseña incorrecta o variable de entorno faltante.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto max-w-md rounded-[20px] p-6">
      <h1 className="text-3xl font-black">Admin ElectroTickets</h1>
      <p className="mt-2 text-sm text-white/62">Entrá para cargar fechas desde tu celular o PC.</p>
      <label className="mt-6 block text-sm font-semibold text-white/78">Contraseña</label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-2 w-full rounded-[12px] border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-white/35"
        placeholder="Tu contraseña admin"
        required
      />
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
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
