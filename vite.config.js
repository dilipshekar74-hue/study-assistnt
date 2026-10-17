import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleRegister, handleLogin, handleMe, handleLogout } from './src/api/authHandlers.js';

function authApiPlugin() {
  return {
    name: 'ved-auth-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (!url?.startsWith('/api/auth/')) {
          return next();
        }

        // Parse JSON body for POST requests
        let body = {};
        if (req.method === 'POST') {
          body = await new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });
        }

        let response;
        if (url === '/api/auth/register' && req.method === 'POST') {
          response = await handleRegister(body, req);
        } else if (url === '/api/auth/login' && req.method === 'POST') {
          response = await handleLogin(body, req);
        } else if (url === '/api/auth/me' && req.method === 'GET') {
          response = await handleMe(req);
        } else if (url === '/api/auth/logout' && req.method === 'POST') {
          response = await handleLogout(req);
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }

        res.statusCode = response.status || 200;
        res.setHeader('Content-Type', 'application/json');
        if (response.headers) {
          for (const [key, val] of Object.entries(response.headers)) {
            res.setHeader(key, val);
          }
        }
        res.end(JSON.stringify(response.data));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), authApiPlugin()],
  server: {
    port: 3000,
    strictPort: false,
  },
  preview: {
    port: 3000,
    strictPort: false,
  },
});
