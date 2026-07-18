/**
 * Serializes structured data without allowing a value containing `</script>`
 * to terminate the JSON-LD script element.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
