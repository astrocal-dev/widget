/**
 * Returns a meeting URL only when it is safe to use as an `href`.
 *
 * Preact sets `href` verbatim, so a stored `javascript:` or `data:` URL would
 * run in the host page. Only http and https links are ever rendered (SEC-256).
 *
 * @param url - The meeting URL from the API, if any.
 * @returns The URL when it is http(s), otherwise null.
 */
export function safeMeetingUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : null;
}
