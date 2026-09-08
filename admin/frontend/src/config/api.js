const configuredAdminApiUrl = import.meta.env.VITE_ADMIN_API_URL || '/api/admin';

export const ADMIN_API_URL = configuredAdminApiUrl.replace(/\/$/, '');
export const MAIN_API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
