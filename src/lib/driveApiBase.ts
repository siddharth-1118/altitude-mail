// ---------------------------------------------------------------------------
// Drive API base URL.
// Altitude Drive runs as its OWN server on port 3002.
// Set VITE_DRIVE_API_URL to point at the drive server.
// ---------------------------------------------------------------------------
export const DRIVE_API_BASE: string =
  (import.meta.env.VITE_DRIVE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

export const driveApiUrl = (path: string): string =>
  `${DRIVE_API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
