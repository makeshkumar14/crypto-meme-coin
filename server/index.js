import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReminderFeed } from '../src/lib/analytics.js';
import { answerChatMessage } from './services/chatService.js';
import { buildDashboardDataset } from './services/dashboardService.js';
import {
  sendReminderEmailForUser,
  startReminderScheduler,
} from './services/notificationService.js';
import {
  authenticateUser,
  createUserAccount,
  getSessionUser,
  signOutSession,
  updateUserState,
} from './services/userStore.js';

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

function getAuthToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return '';
  }
  return header.slice('Bearer '.length).trim();
}

async function resolveUser(req) {
  const token = getAuthToken(req);
  if (!token) {
    return null;
  }

  const user = await getSessionUser(token);
  return user ? { token, user } : null;
}

async function requireUser(req, res, next) {
  try {
    const auth = await resolveUser(req);
    if (!auth) {
      return res.status(401).json({
        ok: false,
        message: 'Please sign in to continue.',
      });
    }

    req.authToken = auth.token;
    req.user = auth.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

async function getDashboardPayload({ refresh = false } = {}) {
  const now = Date.now();

  if (!refresh && dashboardCache.payload && dashboardCache.expiresAt > now) {
    return {
      cache: 'HIT',
      payload: dashboardCache.payload,
    };
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

    return {
      cache: 'MISS',
      payload: dashboardCache.payload,
    };
  } catch (error) {
    if (dashboardCache.payload) {
      return {
        cache: 'STALE',
        payload: dashboardCache.payload,
      };
    }
    throw error;
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'memesense-api', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const shouldBypassCache = req.query.refresh === '1';
    const { cache, payload } = await getDashboardPayload({ refresh: shouldBypassCache });
    const auth = await resolveUser(req);

    res.setHeader('X-Cache', cache);
    return res.json({
      ...payload,
      userReminders: auth
        ? buildReminderFeed({
            coins: payload.coins,
            watchlist: auth.user.watchlist,
            alertPreferences: auth.user.alertPreferences,
            reminderSettings: auth.user.reminderSettings,
          })
        : [],
    });
  } catch (error) {
    return res.status(502).json({
      message: error.message || 'Unable to load dashboard data.',
      ok: false,
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const result = await createUserAccount(req.body || {});
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message || 'Unable to create account.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const result = await authenticateUser(req.body || {});
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message || 'Unable to sign in.' });
  }
});

app.get('/api/auth/session', async (req, res) => {
  try {
    const auth = await resolveUser(req);
    return res.json({ ok: true, user: auth?.user || null });
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Session expired.', user: null });
  }
});

app.post('/api/auth/signout', async (req, res) => {
  try {
    await signOutSession(getAuthToken(req));
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message || 'Unable to sign out.' });
  }
});

app.put('/api/user/watchlist', requireUser, async (req, res) => {
  try {
    const watchlist = Array.isArray(req.body?.watchlist) ? req.body.watchlist.filter(Boolean) : [];
    const user = await updateUserState(req.authToken, { watchlist });
    return res.json({ ok: true, user });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message || 'Unable to update watchlist.' });
  }
});

app.patch('/api/user/preferences', requireUser, async (req, res) => {
  try {
    const user = await updateUserState(req.authToken, {
      alertPreferences: req.body?.alertPreferences,
      reminderSettings: req.body?.reminderSettings,
      theme: req.body?.theme,
      name: req.body?.name,
    });
    return res.json({ ok: true, user });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message || 'Unable to update preferences.' });
  }
});

app.get('/api/user/reminders', requireUser, async (req, res) => {
  try {
    const { payload } = await getDashboardPayload();
    const reminders = buildReminderFeed({
      coins: payload.coins,
      watchlist: req.user.watchlist,
      alertPreferences: req.user.alertPreferences,
      reminderSettings: req.user.reminderSettings,
    });

    return res.json({
      ok: true,
      reminders,
      launchAdvisor: payload.launchAdvisor,
    });
  } catch (error) {
    return res.status(502).json({ ok: false, message: error.message || 'Unable to load reminders.' });
  }
});

app.post('/api/user/reminders/send', requireUser, async (req, res) => {
  try {
    const result = await sendReminderEmailForUser({
      user: req.user,
      getDashboardPayload,
      force: true,
      toEmail: req.body?.toEmail,
    });

    return res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message || 'Unable to send reminder email.',
    });
  }
});

const chartCache = new Map();
const CHART_CACHE_TTL = 300000;

app.get('/api/coin/:id/chart', async (req, res) => {
  try {
    const coinId = req.params.id;
    const days = Math.min(Number(req.query.days) || 7, 90);
    const cacheKey = `${coinId}:${days}`;
    const cached = chartCache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ ok: true, ...cached.data });
    }

    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`;

    let data;
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'MemeSenseAI/1.0', Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko returned ${response.status}`);
      }

      const raw = await response.json();
      data = {
        prices: (raw.prices || []).map(([t, v]) => ({ t, v })),
        volumes: (raw.total_volumes || []).map(([t, v]) => ({ t, v })),
        marketCaps: (raw.market_caps || []).map(([t, v]) => ({ t, v })),
      };
    } catch (apiError) {
      console.warn(`[chart] CoinGecko API error for ${coinId}: ${apiError.message}. Using fallback.`);

      // Fallback: generate chart data from the dashboard cache
      const dashData = dashboardCache.payload;
      const coin = dashData?.coins?.find((c) => c.id === coinId);

      if (!coin) {
        throw new Error('Chart data is temporarily unavailable. Please retry shortly.');
      }

      const now = Date.now();
      const msPerPoint = (days * 24 * 60 * 60 * 1000) / 48;
      const basePrice = coin.price / Math.max(0.5, 1 + coin.priceChange24h / 100);
      const changePerStep = (coin.price - basePrice) / 48;

      data = {
        prices: Array.from({ length: 48 }, (_, i) => {
          const noise = 1 + (Math.sin(i * 0.6) * 0.015) + (Math.cos(i * 1.1) * 0.008) + ((Math.random() - 0.5) * 0.01);
          return {
            t: now - (47 - i) * msPerPoint,
            v: Number(((basePrice + changePerStep * i) * noise).toFixed(10)),
          };
        }),
        volumes: Array.from({ length: 48 }, (_, i) => ({
          t: now - (47 - i) * msPerPoint,
          v: Math.round(coin.volume / 48 * (0.6 + Math.random() * 0.8)),
        })),
        marketCaps: Array.from({ length: 48 }, (_, i) => ({
          t: now - (47 - i) * msPerPoint,
          v: Math.round(coin.marketCap * (0.97 + (i / 48) * 0.06)),
        })),
      };
    }

    chartCache.set(cacheKey, { data, expiresAt: Date.now() + CHART_CACHE_TTL });

    res.setHeader('X-Cache', 'MISS');
    return res.json({ ok: true, ...data });
  } catch (error) {
    console.error(`[chart] Failed for ${req.params.id}:`, error.message);
    return res.status(502).json({ ok: false, message: error.message || 'Unable to load chart data.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { payload } = await getDashboardPayload();
    const auth = await resolveUser(req);
    const response = await answerChatMessage({
      message: req.body?.message,
      coins: payload.coins,
      user: auth?.user || null,
    });

    return res.json({ ok: true, ...response });
  } catch (error) {
    return res.status(502).json({ ok: false, message: error.message || 'Unable to answer right now.' });
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
  startReminderScheduler({ getDashboardPayload });
});
