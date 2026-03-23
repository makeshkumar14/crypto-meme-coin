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

## 21st.dev Toolbar

The 21st.dev browser toolbar is enabled only in local dev mode.

For Codex and other terminal-first agents, the app now mirrors the latest toolbar prompt into a
small floating dev panel so you can copy and paste it without losing the generated context.

If prompts are not reaching your IDE:

1. Install the current 21st.dev IDE extension: `21st-dev.21st-extension`
2. Open one supported IDE window for this repo, or pick the correct window from the toolbar settings
3. Keep the toolbar prompt action on `Send to IDE only` or `Send to IDE and copy`
4. If you previously installed the older `stagewise` extension, switch to the current 21st.dev extension

## Production

```bash
npm.cmd run build
npm.cmd start
```

## Notes

- Sign in / sign up is currently a local prototype flow, not full database auth.
- Fake hype / bot detection is heuristic, not guaranteed bot attribution.
- The backend now degrades more gracefully if one external provider fails.
