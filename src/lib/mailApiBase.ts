// ---------------------------------------------------------------------------
// Mail API base URL.
// altitude Mail runs as its OWN server (a separate process / port, e.g. the
// dev mail server on :3001) and the app connects to it through REST APIs only.
// Set VITE_MAIL_API_URL to point at the mail server; when unset, mail uses the
// same origin as the app (single-server deployment).
// ---------------------------------------------------------------------------
export const MAIL_API_BASE: string =
  (import.meta.env.VITE_MAIL_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export const mailApiUrl = (path: string): string =>
  `${MAIL_API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
