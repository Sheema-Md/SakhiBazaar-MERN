import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adminApiTarget = env.VITE_DEV_ADMIN_API_TARGET;
  const mainApiTarget = env.VITE_DEV_API_TARGET;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      strictPort: true,
      proxy: adminApiTarget || mainApiTarget ? {
        ...(adminApiTarget ? { '/api/admin': adminApiTarget } : {}),
        ...(mainApiTarget ? { '/api': mainApiTarget } : {}),
      } : undefined,
    },
  };
});
