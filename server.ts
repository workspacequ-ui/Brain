import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDatabaseSchema } from './server/schema';
import neonRouter from './api/neon';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable JSON parsing with strict: false so primitives and null are handled without throwing
app.use(express.json({ limit: '50mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to gracefully catch and handle any malformed body-parser syntax errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.warn('[Server] Body-parser syntax warning handled:', err.message);
    return res.status(400).json({ error: 'INVALID_JSON_BODY', message: err.message });
  }
  next(err);
});

// =================================================================
// NEON POSTGRESQL API ROUTES (Mounted via Express Router)
// =================================================================
app.use('/api/neon', neonRouter);
app.use('/api', neonRouter);

// =================================================================
// SERVER STARTUP & VITE INTEGRATION
// =================================================================

async function startServer() {
  // Initialize Neon PostgreSQL tables on server startup if configured
  try {
    await initDatabaseSchema();
  } catch (initErr) {
    console.warn('[Neon PostgreSQL] Schema initialization deferred:', initErr);
  }

  // Vite Development or Static Production Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Brain Space Academy App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
