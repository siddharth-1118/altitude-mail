// ---------------------------------------------------------------------------
// API base URL for the workspace server.
// Defaults to same-origin (the Express server serves both the app and the
// API). Set VITE_API_URL to point at the deployed API host when the frontend
// and backend are hosted separately — after deployment the two still connect
// through this single value.
// ---------------------------------------------------------------------------
export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export const apiUrl = (path: string): string =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
