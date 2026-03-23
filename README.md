# MemeSense AI

A multi-page meme coin intelligence platform with:

- Main landing page for new users
- Dedicated Dashboard, Analytics, Alerts, and Fake Hype Detector pages
- Local sign in / sign up prototype flow
- React + Vite + Tailwind frontend
- Node/Express backend proxy with caching
- CoinGecko, DexScreener, LunarCrush, Reddit fallback, and mock safety nets

## Why the site looked broken before

If you only opened the Vite frontend on `localhost:5173`, the frontend could render without stable live data because the backend API was not always running behind the `/api` proxy. The app now supports a one-command dev flow so frontend and backend start together.

## Local Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Copy the environment template:

```bash
copy .env.example .env
```

3. Put your server-side key in `.env`:

```bash
PORT=8787
CACHE_TTL_MS=180000
LUNARCRUSH_API_KEY=your_real_lunarcrush_key
LUNARCRUSH_BASE_URL=https://lunarcrush.com/api4/public
```

## Development

Run everything together:

```bash
npm.cmd run dev
```

That starts:

- frontend on `http://localhost:5173`
- backend on `http://localhost:8787`

## Production

```bash
npm.cmd run build
npm.cmd start
```

## Notes

- Sign in / sign up is currently a local prototype flow, not full database auth.
- Fake hype / bot detection is heuristic, not guaranteed bot attribution.
- The backend now degrades more gracefully if one external provider fails.
