
import { http } from './http.js';
import { mock } from './mock.js';

export const api = import.meta.env.VITE_USE_MOCK === 'true' ? mock : http;
