import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiApp } from './server/apiApp.js';

// Future Bound Tech - Portfolio Server & Vite Configuration

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'fbt-api-plugin',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/uploads'))) {
                (apiApp as any)(req, res, next);
              } else {
                next();
              }
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
