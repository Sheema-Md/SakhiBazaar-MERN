const configuredApiUrl = import.meta.env.VITE_API_URL || '/api';

export const API_URL = configuredApiUrl.replace(/\/$/, '');
export const API_ORIGIN = import.meta.env.VITE_SOCKET_URL || (
    API_URL.startsWith('/') ? window.location.origin : API_URL.replace(/\/api$/, '')
);
export const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL || window.location.origin;
