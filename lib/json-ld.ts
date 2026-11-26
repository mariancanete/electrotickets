/**
 * Serializa JSON-LD para meterlo en un `<script type="application/ld+json">`.
 *
 * `JSON.stringify` deja pasar `<` tal cual, así que un título o una descripción cargada desde
 * el panel con `</script>` cerraría el bloque y lo que siguiera se ejecutaría como HTML. Se
 * escribe `<` como `<`: para un parser de JSON (Google incluido) es exactamente el mismo
 * carácter, así que los datos estructurados no cambian.
 */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
