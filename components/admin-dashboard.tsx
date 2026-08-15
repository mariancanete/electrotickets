"use client";

import { useMemo, useState } from "react";
import { isUpcomingEvent } from "@/lib/event-dates";
import { parseJsonResponse } from "@/lib/http";
import type { EventPerformance, EventSaleRecord } from "@/types/analytics";
import type { VenueRecord, GenreRecord } from "@/types/catalog";
import type { EventRecord } from "@/types/event";

type FormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  flyer_url: string;
  lineup: string;
  venue_id: string;
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
  last_tickets: boolean;
  sold_out: boolean;
  published: boolean;
};

type VenueFormState = {
  name: string;
  address: string;
  city: string;
  province: string;
  map_url: string;
};

type SaleFormState = {
  event_id: string;
  sale_date: string;
  tickets_sold: string;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  flyer_url: "",
  lineup: "",
  venue_id: "",
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
  last_tickets: false,
  sold_out: false,
  published: true
};

const emptyVenueForm: VenueFormState = {
  name: "",
  address: "",
  city: "Buenos Aires",
  province: "CABA",
  map_url: ""
};

export function AdminDashboard({
  initialEvents,
  initialVenues,
  initialGenres,
  performance,
  initialSales,
  analyticsReady
}: {
  initialEvents: EventRecord[];
  initialVenues: VenueRecord[];
  initialGenres: GenreRecord[];
  performance: Record<string, EventPerformance>;
  initialSales: EventSaleRecord[];
  analyticsReady: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [venues, setVenues] = useState(initialVenues);
  const [genres, setGenres] = useState(initialGenres);
  const [sales, setSales] = useState(initialSales);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesMessage, setSalesMessage] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [venueForm, setVenueForm] = useState<VenueFormState>(emptyVenueForm);
  const [newGenre, setNewGenre] = useState("");
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [catalogMessage, setCatalogMessage] = useState("");

  const isEditing = Boolean(form.id);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [events]
  );

  const sortedVenues = useMemo(
    () => [...venues].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [venues]
  );

  const sortedGenres = useMemo(
    () => [...genres].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "es")),
    [genres]
  );

  const [listPeriod, setListPeriod] = useState<PeriodFilter>("upcoming");

  const visibleEvents = useMemo(
    () =>
      sortedEvents.filter((event) =>
        listPeriod === "all" ? true : listPeriod === "upcoming" ? isUpcomingEvent(event) : !isUpcomingEvent(event)
      ),
    [sortedEvents, listPeriod]
  );

  const salesByEvent = useMemo(
    () =>
      sales.reduce<Record<string, number>>((acc, sale) => {
        acc[sale.event_id] = (acc[sale.event_id] || 0) + sale.tickets_sold;
        return acc;
      }, {}),
    [sales]
  );

  /**
   * La tabla que responde "¿por qué tengo tráfico y no ventas?": clics enviados a Bombo
   * contra entradas efectivamente vendidas, por evento.
   */
  const reconciliation = useMemo(
    () =>
      sortedEvents
        .map((event) => {
          const stats = performance[event.slug];
          const clicks = stats?.clicks ?? event.clicks_count ?? 0;
          const ticketsSold = salesByEvent[event.id] || 0;

          return {
            event,
            upcoming: isUpcomingEvent(event),
            clicks,
            clicksLast7Days: stats?.clicksLast7Days ?? 0,
            ticketsSold,
            conversion: clicks > 0 ? ticketsSold / clicks : null,
            topPlacement: topKey(stats?.byPlacement),
            topSource: topKey(stats?.bySource)
          };
        })
        .filter((row) => row.clicks > 0 || row.ticketsSold > 0)
        .sort((a, b) => b.clicks - a.clicks),
    [performance, salesByEvent, sortedEvents]
  );

  const genreIsFromCatalog = sortedGenres.some((genre) => genre.name === form.genre);
  const genreSelectValue = form.genre && genreIsFromCatalog ? form.genre : form.genre ? "__custom" : "";

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateVenueForm<K extends keyof VenueFormState>(key: K, value: VenueFormState[K]) {
    setVenueForm((current) => ({ ...current, [key]: value }));
  }

  function findVenueForEvent(event: EventRecord) {
    return venues.find((venue) => {
      const sameName = event.venue_name && venue.name.toLowerCase() === event.venue_name.toLowerCase();
      const sameAddress = !event.venue_address || !venue.address || venue.address.toLowerCase() === event.venue_address.toLowerCase();
      return Boolean(sameName && sameAddress);
    });
  }

  function selectEvent(event: EventRecord) {
    const matchedVenue = findVenueForEvent(event);

    setForm({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description || "",
      flyer_url: event.flyer_url || "",
      lineup: event.lineup?.join("\n") || "",
      venue_id: matchedVenue?.id || "",
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
      last_tickets: Boolean(event.last_tickets),
      sold_out: Boolean(event.sold_out),
      published: event.published
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyVenue(venueId: string) {
    if (!venueId) {
      setForm((current) => ({ ...current, venue_id: "" }));
      return;
    }

    const venue = venues.find((item) => item.id === venueId);
    if (!venue) return;

    setForm((current) => ({
      ...current,
      venue_id: venue.id,
      venue_name: venue.name,
      venue_address: venue.address || "",
      city: venue.city || current.city || "Buenos Aires",
      province: venue.province || current.province || "CABA",
      map_url: venue.map_url || ""
    }));
  }

  async function createVenue() {
    setCatalogLoading(true);
    setCatalogMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "venue", venue: venueForm })
      });
      const result = await parseJsonResponse<{ venue: VenueRecord }>(response, "No se pudo guardar el venue.");

      const saved = result.venue;
      setVenues((current) => [...current, saved]);
      setVenueForm(emptyVenueForm);
      setCatalogMessage("Venue guardado. Ya podés reutilizarlo en próximos eventos.");
      setForm((current) => ({
        ...current,
        venue_id: saved.id,
        venue_name: saved.name,
        venue_address: saved.address || "",
        city: saved.city || current.city || "Buenos Aires",
        province: saved.province || current.province || "CABA",
        map_url: saved.map_url || ""
      }));
    } catch (error) {
      setCatalogMessage(error instanceof Error ? error.message : "No se pudo guardar el venue.");
    } finally {
      setCatalogLoading(false);
    }
  }

  async function createGenre() {
    const name = newGenre.trim();
    if (!name) return;

    setCatalogLoading(true);
    setCatalogMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "genre", genre: { name, sort_order: genres.length + 1 } })
      });
      const result = await parseJsonResponse<{ genre: GenreRecord }>(response, "No se pudo guardar el género.");

      const saved = result.genre;
      setGenres((current) => [...current, saved]);
      setNewGenre("");
      updateField("genre", saved.name);
      setCatalogMessage("Género guardado. Ya queda disponible para futuras cargas.");
    } catch (error) {
      setCatalogMessage(error instanceof Error ? error.message : "No se pudo guardar el género.");
    } finally {
      setCatalogLoading(false);
    }
  }

  async function uploadFlyer() {
    if (!flyerFile) return form.flyer_url;

    const body = new FormData();
    body.append("file", flyerFile);

    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await parseJsonResponse<{ publicUrl: string }>(response, "No se pudo subir el flyer.");

    return result.publicUrl;
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
          .filter(Boolean),
        sold_out: Boolean(form.sold_out)
      };

      const response = await fetch("/api/admin/events", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await parseJsonResponse<{ event: EventRecord }>(response, "No se pudo guardar el evento.");

      setEvents((current) => {
        const saved = result.event;
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

    try {
      const response = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      await parseJsonResponse<{ ok: boolean }>(response, "No se pudo eliminar el evento.");

      setEvents((current) => current.filter((event) => event.id !== id));
      setMessage("Evento eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el evento.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSale(form: SaleFormState) {
    setSalesLoading(true);
    setSalesMessage("");

    try {
      const response = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: form.event_id,
          sale_date: form.sale_date,
          tickets_sold: Number(form.tickets_sold)
        })
      });
      const result = await parseJsonResponse<{ sale: EventSaleRecord }>(response, "No se pudo guardar la venta.");

      setSales((current) => {
        const others = current.filter(
          (sale) => !(sale.event_id === result.sale.event_id && sale.sale_date === result.sale.sale_date)
        );
        return [result.sale, ...others].sort((a, b) => b.sale_date.localeCompare(a.sale_date));
      });
      setSalesMessage("Venta registrada.");
    } catch (error) {
      setSalesMessage(error instanceof Error ? error.message : "No se pudo guardar la venta.");
    } finally {
      setSalesLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-200/70">Panel privado</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Cargar eventos</h1>
          <p className="mt-3 text-white/62">Subí flyer, elegí venue/género, pegá link de Bombo y publicá rápido.</p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/78 hover:bg-white/10"
        >
          Salir
        </button>
      </div>

      <ConversionPanel
        analyticsReady={analyticsReady}
        reconciliation={reconciliation}
        events={sortedEvents}
        onSaveSale={saveSale}
        loading={salesLoading}
        message={salesMessage}
      />

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="glass space-y-5 rounded-[20px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">{isEditing ? "Editar evento" : "Nuevo evento"}</h2>
            {isEditing ? (
              <button type="button" onClick={() => setForm(emptyForm)} className="text-sm text-white/62 hover:text-white">
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
              <select
                value={genreSelectValue}
                onChange={(event) => {
                  const value = event.target.value;
                  updateField("genre", value === "__custom" ? "" : value);
                }}
                className="input"
              >
                <option value="">Seleccionar género</option>
                {sortedGenres.map((genre) => (
                  <option key={genre.id} value={genre.name}>{genre.name}</option>
                ))}
                <option value="__custom">Otro / manual</option>
              </select>
              {genreSelectValue === "__custom" || !form.genre ? (
                <input
                  value={form.genre}
                  onChange={(event) => updateField("genre", event.target.value)}
                  className="input mt-2"
                  placeholder="Ej: Hard Groove"
                />
              ) : null}
            </Field>
          </div>

          <Field label="Link de vendedor Bombo">
            <input required value={form.bombo_url} onChange={(event) => updateField("bombo_url", event.target.value)} className="input" placeholder="https://..." />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue guardado">
              <select value={form.venue_id} onChange={(event) => applyVenue(event.target.value)} className="input">
                <option value="">Carga manual</option>
                {sortedVenues.map((venue) => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Banda de precios">
              <input value={form.price_label} onChange={(event) => updateField("price_label", event.target.value)} className="input" placeholder="$20.000 - $35.000" />
            </Field>
          </div>

          <Field label="Venue">
            <input value={form.venue_name} onChange={(event) => updateField("venue_name", event.target.value)} className="input" placeholder="Ej: The Bow" />
          </Field>

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

          <details className="rounded-[20px] border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-bold text-white/78">Guardar nuevo venue para próximas cargas</summary>
            <div className="mt-4 grid gap-3">
              <input value={venueForm.name} onChange={(event) => updateVenueForm("name", event.target.value)} className="input" placeholder="Nombre del venue" />
              <input value={venueForm.address} onChange={(event) => updateVenueForm("address", event.target.value)} className="input" placeholder="Dirección" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={venueForm.city} onChange={(event) => updateVenueForm("city", event.target.value)} className="input" placeholder="Ciudad" />
                <input value={venueForm.province} onChange={(event) => updateVenueForm("province", event.target.value)} className="input" placeholder="Provincia" />
              </div>
              <input value={venueForm.map_url} onChange={(event) => updateVenueForm("map_url", event.target.value)} className="input" placeholder="Google Maps URL" />
              <button type="button" disabled={catalogLoading} onClick={createVenue} className="rounded-full border border-white/15 px-4 py-3 text-sm font-bold text-white/78 hover:bg-white/10 disabled:opacity-50">
                Guardar venue y usarlo
              </button>
            </div>
          </details>

          <details className="rounded-[20px] border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-bold text-white/78">Agregar género rápido</summary>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input value={newGenre} onChange={(event) => setNewGenre(event.target.value)} className="input" placeholder="Ej: Hard Groove" />
              <button type="button" disabled={catalogLoading} onClick={createGenre} className="rounded-full border border-white/15 px-4 py-3 text-sm font-bold text-white/78 hover:bg-white/10 disabled:opacity-50">
                Guardar
              </button>
            </div>
          </details>

          {catalogMessage ? <p className="rounded-[12px] bg-violet-400/10 px-4 py-3 text-sm text-violet-100">{catalogMessage}</p> : null}

          <Field label="Lineup">
            <textarea value={form.lineup} onChange={(event) => updateField("lineup", event.target.value)} className="input min-h-24" placeholder="Un artista por línea" />
          </Field>


          <Field label="Videoset YouTube URL">
            <input value={form.video_url} onChange={(event) => updateField("video_url", event.target.value)} className="input" placeholder="https://youtube.com/watch?v=..." />
          </Field>

          <Field label="Flyer">
            <input type="file" accept="image/*" onChange={(event) => setFlyerFile(event.target.files?.[0] || null)} className="input" />
            <input value={form.flyer_url} onChange={(event) => updateField("flyer_url", event.target.value)} className="input mt-2" placeholder="O pegá una URL de imagen" />
          </Field>

          <div className="grid gap-3 rounded-[20px] border border-white/10 bg-black/25 p-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-sm text-white/78">
              <input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} />
              Destacado en home
            </label>
            <label className="flex items-start gap-3 text-sm text-white/78">
              <input type="checkbox" checked={form.last_tickets} onChange={(event) => updateField("last_tickets", event.target.checked)} className="mt-1" />
              <span>
                <span className="block">Últimas entradas</span>
                <span className="mt-1 block text-xs leading-5 text-white/48">Mostrar badge de urgencia en la web pública.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-white/78">
              <input type="checkbox" checked={form.sold_out} onChange={(event) => updateField("sold_out", event.target.checked)} className="mt-1" />
              <span>
                <span className="block">Sold Out</span>
                <span className="mt-1 block text-xs leading-5 text-white/48">Mostrar badge de evento agotado en la web pública.</span>
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm text-white/78">
              <input type="checkbox" checked={form.published} onChange={(event) => updateField("published", event.target.checked)} />
              Publicado
            </label>
          </div>

          {message ? <p className="rounded-[12px] bg-white/10 px-4 py-3 text-sm text-white/78">{message}</p> : null}

          <button disabled={loading} className="w-full rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-white/85 disabled:opacity-50">
            {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Publicar evento"}
          </button>
        </form>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black">Eventos cargados</h2>
            <p className="text-sm text-white/48">{venues.length} venues · {genres.length} géneros guardados</p>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-black/25 p-1">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setListPeriod(option.value)}
                aria-pressed={listPeriod === option.value}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  listPeriod === option.value ? "bg-white text-black" : "text-white/62 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {visibleEvents.length ? null : (
            <p className="text-sm text-white/48">
              No hay eventos {listPeriod === "upcoming" ? "vigentes" : "finalizados"} cargados.
            </p>
          )}
          {visibleEvents.map((event) => (
            <article key={event.id} className="glass grid gap-4 rounded-[20px] p-4 sm:grid-cols-[92px_1fr]">
              <div className="aspect-square overflow-hidden rounded-[12px] bg-white/5">
                {/* Miniatura del panel privado: el flyer puede venir de cualquier host pegado
                    a mano, así que no pasa por next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {event.flyer_url ? <img src={event.flyer_url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="mt-1 text-sm text-white/62">{new Date(event.starts_at).toLocaleString("es-AR")} · {event.genre}</p>
                    <p className="mt-1 text-xs text-white/48">{event.venue_name || "Sin venue"} · Clicks: {event.clicks_count || 0}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {Boolean(event.sold_out) ? (
                      <span className="rounded-full bg-red-600/25 px-3 py-1 text-xs font-bold text-red-50">Sold Out</span>
                    ) : Boolean(event.last_tickets) ? (
                      <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-100">Últimas entradas</span>
                    ) : null}
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${event.published ? "bg-emerald-400/15 text-emerald-200" : "bg-zinc-400/15 text-zinc-200"}`}>
                      {event.published ? "Publicado" : "Oculto"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/eventos/${event.slug}`} target="_blank" className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/78 hover:bg-white/10">Ver</a>
                  <button onClick={() => selectEvent(event)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/78 hover:bg-white/10">Editar</button>
                  <button onClick={() => removeEvent(event.id)} className="rounded-full border border-red-400/20 px-3 py-2 text-xs text-red-200 hover:bg-red-400/10">Eliminar</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

    </div>
  );
}

function topKey(counts?: Record<string, number>) {
  if (!counts) return null;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries[0][0] : null;
}

type ReconciliationRow = {
  event: EventRecord;
  upcoming: boolean;
  clicks: number;
  clicksLast7Days: number;
  ticketsSold: number;
  conversion: number | null;
  topPlacement: string | null;
  topSource: string | null;
};

type PeriodFilter = "upcoming" | "past" | "all";

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: "upcoming", label: "Vigentes" },
  { value: "past", label: "Finalizados" },
  { value: "all", label: "Todos" }
];

/**
 * Panel de conversión. Cruza los clics hacia Bombo con las ventas que se cargan a mano
 * desde el reporte de Bombo, que es lo único que permite saber si el problema está en el
 * tráfico, en la página del evento o en el checkout externo.
 */
function ConversionPanel({
  analyticsReady,
  reconciliation,
  events,
  onSaveSale,
  loading,
  message
}: {
  analyticsReady: boolean;
  reconciliation: ReconciliationRow[];
  events: EventRecord[];
  onSaveSale: (form: SaleFormState) => void;
  loading: boolean;
  message: string;
}) {
  const [saleForm, setSaleForm] = useState<SaleFormState>({
    event_id: "",
    sale_date: new Date().toISOString().slice(0, 10),
    tickets_sold: ""
  });

  // Por defecto solo las fechas vigentes: son las únicas sobre las que todavía se puede
  // actuar. Las finalizadas siguen disponibles porque su histórico es lo que da la base
  // de comparación, pero no tienen por qué ensuciar la vista del día a día.
  const [period, setPeriod] = useState<PeriodFilter>("upcoming");

  const visibleRows = useMemo(
    () =>
      reconciliation.filter((row) =>
        period === "all" ? true : period === "upcoming" ? row.upcoming : !row.upcoming
      ),
    [reconciliation, period]
  );

  const hiddenCount = reconciliation.length - visibleRows.length;

  // Los totales acompañan al filtro: mezclar clics de fechas viejas con las vigentes daba
  // una tasa global que no describía ningún período concreto.
  const totals = useMemo(
    () =>
      visibleRows.reduce(
        (acc, row) => ({
          clicks: acc.clicks + row.clicks,
          tickets: acc.tickets + row.ticketsSold
        }),
        { clicks: 0, tickets: 0 }
      ),
    [visibleRows]
  );

  const globalConversion = totals.clicks > 0 ? totals.tickets / totals.clicks : null;

  // El selector de ventas también arranca por vigentes, que es donde se cargan a diario.
  const saleEvents = useMemo(() => {
    const upcoming = events.filter(isUpcomingEvent);
    const past = events.filter((event) => !isUpcomingEvent(event));
    return { upcoming, past };
  }, [events]);

  return (
    <section className="glass mb-8 rounded-[20px] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Conversión</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-white/62">
            Clics enviados a Bombo contra entradas vendidas. Cargá las ventas por evento y por día desde el
            reporte de Bombo para ver la tasa real.
          </p>
        </div>
        <div className="flex gap-3">
          <Metric label="Clics" value={String(totals.clicks)} />
          <Metric label="Vendidas" value={String(totals.tickets)} />
          <Metric
            label="Clic → venta"
            value={globalConversion === null ? "—" : `${(globalConversion * 100).toFixed(1)}%`}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-white/10 bg-black/25 p-1">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              aria-pressed={period === option.value}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                period === option.value ? "bg-white text-black" : "text-white/62 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {hiddenCount > 0 ? (
          <p className="text-xs text-white/48">
            {hiddenCount} {hiddenCount === 1 ? "fecha oculta" : "fechas ocultas"} por este filtro
          </p>
        ) : null}
      </div>

      {!analyticsReady ? (
        <p className="mt-5 rounded-[12px] border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-base leading-7 text-amber-100">
          Faltan las tablas de medición. Ejecutá <code className="font-mono">supabase/05-analytics.sql</code> en el SQL
          Editor de Supabase. Hasta entonces se muestra solo el contador histórico de clics.
        </p>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!saleForm.event_id) return;
          onSaveSale(saleForm);
        }}
        className="mt-5 grid gap-3 rounded-[20px] border border-white/10 bg-black/20 p-4 sm:grid-cols-[1.6fr_1fr_0.8fr_auto]"
      >
        <select
          value={saleForm.event_id}
          onChange={(event) => setSaleForm((current) => ({ ...current, event_id: event.target.value }))}
          className="input"
        >
          <option value="">Elegí un evento</option>
          {saleEvents.upcoming.length ? (
            <optgroup label="Vigentes">
              {saleEvents.upcoming.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </optgroup>
          ) : null}
          {saleEvents.past.length ? (
            <optgroup label="Finalizados">
              {saleEvents.past.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
        <input
          type="date"
          value={saleForm.sale_date}
          onChange={(event) => setSaleForm((current) => ({ ...current, sale_date: event.target.value }))}
          className="input"
        />
        <input
          type="number"
          min="0"
          required
          value={saleForm.tickets_sold}
          onChange={(event) => setSaleForm((current) => ({ ...current, tickets_sold: event.target.value }))}
          className="input"
          placeholder="Vendidas"
        />
        <button
          disabled={loading || !saleForm.event_id}
          className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </form>

      {message ? (
        <p className="mt-3 rounded-[12px] bg-white/10 px-4 py-3 text-sm text-white/78">{message}</p>
      ) : null}

      {visibleRows.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.15em] text-white/48">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Evento</th>
                <th className="pb-3 pr-4 font-semibold">Clics</th>
                <th className="pb-3 pr-4 font-semibold">7 días</th>
                <th className="pb-3 pr-4 font-semibold">Vendidas</th>
                <th className="pb-3 pr-4 font-semibold">Clic → venta</th>
                <th className="pb-3 pr-4 font-semibold">Mejor CTA</th>
                <th className="pb-3 font-semibold">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visibleRows.map((row) => (
                <tr key={row.event.id}>
                  <td className="py-3 pr-4 font-semibold text-white/78">
                    {row.event.title}
                    {row.upcoming ? null : (
                      <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/62">
                        finalizado
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-white/78">{row.clicks}</td>
                  <td className="py-3 pr-4 text-white/62">{row.clicksLast7Days}</td>
                  <td className="py-3 pr-4 text-white/78">{row.ticketsSold}</td>
                  <td className="py-3 pr-4 font-bold text-white">
                    {row.conversion === null ? "—" : `${(row.conversion * 100).toFixed(1)}%`}
                  </td>
                  <td className="py-3 pr-4 text-white/62">{row.topPlacement || "—"}</td>
                  <td className="py-3 text-white/62">{row.topSource || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : reconciliation.length ? (
        <p className="mt-5 text-base leading-7 text-white/48">
          No hay fechas {period === "upcoming" ? "vigentes" : "finalizadas"} con actividad registrada. Probá con
          otro filtro para ver el resto.
        </p>
      ) : (
        <p className="mt-5 text-base leading-7 text-white/48">
          Todavía no hay clics registrados en la ventana de análisis. Los datos aparecen acá a medida que la gente
          use los botones de compra.
        </p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-black/25 px-4 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/78">{label}</span>
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
