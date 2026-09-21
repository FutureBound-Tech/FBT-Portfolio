import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiApp } from './server/apiApp.js';

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
            server.middlewares.use('/api', (req, res, next) => {
              (apiApp as any)(req, res, next);
            });
            server.middlewares.use('/uploads', (req, res, next) => {
              import('serve-static').then(serveStatic => {
                serveStatic.default(path.resolve(__dirname, 'server/uploads'))(req, res, next);
              }).catch(() => {
                (apiApp as any)(req, res, next);
              });
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
