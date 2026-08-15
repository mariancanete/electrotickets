"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { key: "days", label: "días" },
  { key: "hours", label: "horas" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "seg" }
] as const;

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    finished: diff <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

/**
 * Cuenta regresiva hasta la fecha.
 *
 * Es cálculo de fecha en el cliente: no consulta nada ni depende de datos nuevos. Aporta la
 * información que un comprador realmente quiere de un vistazo —cuánto falta— en un formato
 * que en un teléfono se entiende sin leer.
 *
 * Se renderiza vacío en el primer paso para que el HTML del servidor y el del cliente
 * coincidan; si arrancara con la cuenta ya calculada, cada visita daría un valor distinto.
 */
export function EventCountdown({ startsAt }: { startsAt: string }) {
  const target = new Date(startsAt).getTime();
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;

    // El primer valor se calcula en el siguiente frame en vez de en el cuerpo del efecto:
    // llena la cuenta a los ~16 ms, sin la pausa de un segundo que dejaría esperar al
    // intervalo y sin encadenar renders desde el propio efecto.
    const frame = requestAnimationFrame(() => setRemaining(getRemaining(target)));
    const interval = setInterval(() => setRemaining(getRemaining(target)), 1000);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
    };
  }, [target]);

  if (!remaining || remaining.finished) return null;

  return (
    <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/48">Comienza en</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
        {UNITS.map((unit) => (
          <div
            key={unit.key}
            className="rounded-[12px] border border-white/10 bg-black/30 py-3 text-center"
          >
            <p className="tabular text-2xl font-medium leading-none text-white sm:text-3xl">
              {String(remaining[unit.key]).padStart(2, "0")}
            </p>
            <p className="mt-1.5 text-[11px] text-white/48">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
