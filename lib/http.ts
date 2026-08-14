/**
 * Lectura segura de respuestas JSON en el panel de administración.
 *
 * El panel llamaba `await response.json()` antes de mirar `response.ok` o el content-type.
 * Cuando la plataforma responde con HTML en vez de JSON — típicamente un 413 cuando el
 * flyer supera el límite de body de las funciones serverless, o un 504 por timeout —
 * `.json()` lanza "JSON.parse: unexpected character at line 1 column 1" y ese texto crudo
 * terminaba en pantalla, sin explicar nada.
 */
export async function parseJsonResponse<T>(response: Response, fallbackError: string): Promise<T> {
  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";

  let payload: unknown = null;
  if (contentType.includes("application/json") && raw.trim()) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const fromBody =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : "";

    throw new Error(fromBody || messageForStatus(response.status) || fallbackError);
  }

  if (payload === null) throw new Error(fallbackError);

  return payload as T;
}

function messageForStatus(status: number) {
  if (status === 401 || status === 403) return "Se cerró la sesión. Volvé a iniciar sesión en el panel.";
  if (status === 413) return "El flyer es demasiado pesado. Comprimilo o usá una imagen menor a 2 MB.";
  if (status === 504 || status === 408) return "La operación tardó demasiado. Probá de nuevo en unos segundos.";
  if (status >= 500) return "El servidor tuvo un error. Probá de nuevo en unos segundos.";
  return "";
}
