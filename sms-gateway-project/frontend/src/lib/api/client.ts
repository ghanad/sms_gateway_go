import createClient from 'openapi-fetch';
import type { paths } from './types';

// Determine API base URL. In development the frontend is served from
// http://localhost:5173 and requests should be proxied to the backend
// service. Prefixing with `/api` ensures the Vite/Ngix proxy forwards the
// requests to the correct backend port.
const rawBaseUrl =
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

// Always target the `/api` prefix; strip any trailing slash from the env var
// to avoid double slashes.
const baseUrl = `${rawBaseUrl.replace(/\/$/, '')}/api`;

export const apiClient = createClient<paths>({ baseUrl });

export default apiClient;
