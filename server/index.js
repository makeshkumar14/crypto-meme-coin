import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDashboardDataset } from './services/dashboardService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const app = express();
const port = Number(process.env.PORT || 8787);
const cacheTtlMs = Number(process.env.CACHE_TTL_MS || 180000);

let dashboardCache = {
  expiresAt: 0,
  payload: null,
};

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'memesense-api', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', async (req, res) => {
  const shouldBypassCache = req.query.refresh === '1';
  const now = Date.now();

  if (!shouldBypassCache && dashboardCache.payload && dashboardCache.expiresAt > now) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(dashboardCache.payload);
  }

  try {
    const payload = await buildDashboardDataset();
    dashboardCache = {
      payload: {
        ...payload,
        lastUpdated: new Date().toISOString(),
      },
      expiresAt: now + cacheTtlMs,
    };

    res.setHeader('X-Cache', 'MISS');
    return res.json(dashboardCache.payload);
  } catch (error) {
    return res.status(502).json({
      message: error.message || 'Unable to load dashboard data.',
      ok: false,
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`MemeSense AI server listening on http://localhost:${port}`);
});
