import { defineConfig, loadEnv } from 'vite';

// Em desenvolvimento, as chamadas do front para /api são repassadas ao backend (sem o /api).
// Isso evita problemas de CORS. Ajuste BACKEND_URL no .env.development.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:3000',
          changeOrigin: true,
          // O backend não usa o prefixo /api; ele só existe no front.
          rewrite: (caminho) => caminho.replace(/^\/api/, ''),
        },
      },
    },
  };
});
