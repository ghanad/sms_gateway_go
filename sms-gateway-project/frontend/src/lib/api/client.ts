import createClient from 'openapi-fetch';
import type { paths } from './types';

// Determine API base URL from environment without auto-prefixing.
const baseUrl = (
  import.meta.env.NEXT_PUBLIC_API_BASE ||
  import.meta.env.VITE_API_BASE ||
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).replace(/\/$/, '');

export const apiClient = createClient<paths>({ baseUrl });

export default apiClient;
