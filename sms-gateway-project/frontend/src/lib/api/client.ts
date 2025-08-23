import createClient from 'openapi-fetch';
import type { paths } from './types';

const baseUrl = import.meta.env.NEXT_PUBLIC_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = createClient<paths>({ baseUrl });

export default apiClient;
