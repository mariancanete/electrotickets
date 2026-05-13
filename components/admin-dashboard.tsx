"use client";

import { useMemo, useState } from "react";
import type { EventRecord } from "@/types/event";

type FormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  flyer_url: string;
  lineup: string;
  venue_name: string;
  venue_address: string;
  city: string;
  province: string;
  map_url: string;
  starts_at: string;
  price_label: string;
  genre: string;
  video_url: string;
  bombo_url: string;
  featured: boolean;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  flyer_url: "",
  lineup: "",
  venue_name: "",
  venue_address: "",
  city: "Buenos Aires",
  province: "CABA",
  map_url: "",
  starts_at: "",
  price_label: "",
  genre: "Techno",
  video_url: "",
  bombo_url: "",
  featured: false,
  published: true
};

export function AdminDashboard({ initialEvents }: { initialEvents: EventRecord[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isEditing = Boolean(form.id);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [events]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectEvent(event: EventRecord) {
    setForm({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description || "",
      flyer_url: event.flyer_url || "",
      lineup: event.lineup?.join("\n") || "",
      venue_name: event.venue_name || "",
      venue_address: event.venue_address || "",
      city: event.city || "Buenos Aires",
      province: event.province || "CABA",
      map_url: event.map_url || "",
      starts_at: toDatetimeLocal(event.starts_at),
      price_label: event.price_label || "",
      genre: event.genre || "Techno",
      video_url: event.video_url || "",
      bombo_url: event.bombo_url,
      featured: event.featured,
      published: event.published
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFlyer() {
    if (!flyerFile) return form.flyer_url;

    const body = new FormData();
    body.append("file", flyerFile);

    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo subir el flyer.");
    }

    return result.publicUrl as string;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const flyerUrl = await uploadFlyer();
      const payload = {
        ...form,
        flyer_url: flyerUrl,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : "",
        lineup: form.lineup
          .split(/\n|,/)
          .map((artist) => artist.trim())
          .filter(Boolean)
      };

      const response = await fetch("/api/admin/events", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el evento.");

      setEvents((current) => {
        const saved = result.event as EventRecord;
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });

      setForm(emptyForm);
      setFlyerFile(null);
      setMessage(isEditing ? "Evento actualizado." : "Evento creado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  async function removeEvent(id: string) {
    if (!confirm("¿Eliminar este evento?")) return;
    setLoading(true);
    const response = await fetch("/api/admin/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setLoading(false);
    if (response.ok) {
      setEvents((current) => current.filter((event) => event.id !== id));
      setMessage("Evento eliminado.");
    } else {
      setMessage("No se pudo eliminar el evento.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Panel privado</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Cargar eventos</h1>
          <p className="mt-3 text-white/55">Subí flyer, pegá link de Bombo y publicá en menos de un minuto.</p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
        >
          Salir
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="glass space-y-5 rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">{isEditing ? "Editar evento" : "Nuevo evento"}</h2>
            {isEditing ? (
              <button type="button" onClick={() => setForm(emptyForm)} className="text-sm text-white/55 hover:text-white">
                Cancelar edición
              </button>
            ) : null}
          </div>

          <Field label="Título">
            <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className="input" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha y hora">
              <input required type="datetime-local" value={form.starts_at} onChange={(event) => updateField("starts_at", event.target.value)} className="input" />
            </Field>
            <Field label="Género">
              <input value={form.genre} onChange={(event) => updateField("genre", event.target.value)} className="input" placeholder="Techno, House..." />
            </Field>
          </div>

          <Field label="Link de vendedor Bombo">
            <input required value={form.bombo_url} onChange={(event) => updateField("bombo_url", event.target.value)} className="input" placeholder="https://..." />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue">
              <input value={form.venue_name} onChange={(event) => updateField("venue_name", event.target.value)} className="input" />
            </Field>
            <Field label="Banda de precios">
              <input value={form.price_label} onChange={(event) => updateField("price_label", event.target.value)} className="input" placeholder="$20.000 - $35.000" />
            </Field>
          </div>

          <Field label="Dirección / ubicación">
            <input value={form.venue_address} onChange={(event) => updateField("venue_address", event.target.value)} className="input" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ciudad">
              <input value={form.city} onChange={(event) => updateField("city", event.target.value)} className="input" />
            </Field>
            <Field label="Provincia">
              <input value={form.province} onChange={(event) => updateField("province", event.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Google Maps URL">
            <input value={form.map_url} onChange={(event) => updateField("map_url", event.target.value)} className="input" placeholder="https://maps.google.com/..." />
          </Field>

          <Field label="Lineup">
            <textarea value={form.lineup} onChange={(event) => updateField("lineup", event.target.value)} className="input min-h-24" placeholder="Un artista por línea" />
          </Field>

          <Field label="Descripción breve">
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} className="input min-h-24" />
          </Field>

          <Field label="Videoset YouTube URL">
            <input value={form.video_url} onChange={(event) => updateField("video_url", event.target.value)} className="input" placeholder="https://youtube.com/watch?v=..." />
          </Field>

          <Field label="Flyer">
            <input type="file" accept="image/*" onChange={(event) => setFlyerFile(event.target.files?.[0] || null)} className="input" />
            <input value={form.flyer_url} onChange={(event) => updateField("flyer_url", event.target.value)} className="input mt-2" placeholder="O pegá una URL de imagen" />
          </Field>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} />
              Destacado en home
            </label>
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input type="checkbox" checked={form.published} onChange={(event) => updateField("published", event.target.checked)} />
              Publicado
            </label>
          </div>

          {message ? <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/75">{message}</p> : null}

          <button disabled={loading} className="w-full rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-white/85 disabled:opacity-50">
            {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Publicar evento"}
          </button>
        </form>

        <section className="space-y-4">
          <h2 className="text-2xl font-black">Eventos cargados</h2>
          {sortedEvents.map((event) => (
            <article key={event.id} className="glass grid gap-4 rounded-[1.6rem] p-4 sm:grid-cols-[92px_1fr]">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white/5">
                {event.flyer_url ? <img src={event.flyer_url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="mt-1 text-sm text-white/50">{new Date(event.starts_at).toLocaleString("es-AR")} · {event.genre}</p>
                    <p className="mt-1 text-xs text-white/38">Clicks: {event.clicks_count || 0}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${event.published ? "bg-emerald-400/15 text-emerald-200" : "bg-zinc-400/15 text-zinc-200"}`}>
                    {event.published ? "Publicado" : "Oculto"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/eventos/${event.slug}`} target="_blank" className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10">Ver</a>
                  <button onClick={() => selectEvent(event)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10">Editar</button>
                  <button onClick={() => removeEvent(event.id)} className="rounded-full border border-red-400/20 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10">Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.28);
          padding: 0.78rem 0.95rem;
          outline: none;
          color: white;
        }
        .input:focus {
          border-color: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/68">{label}</span>
      {children}
    </label>
  );
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}
