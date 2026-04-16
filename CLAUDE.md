# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build (npx vite build)
npm run preview    # Preview production build locally
```

No test or lint commands are configured.

## Environment Variables

Required for full functionality:
- `ANTHROPIC_API_KEY` — Claude API access (used by `api/chat.js`)
- `KV_REST_API_URL` — Vercel KV (auto-set by Vercel when KV database is linked)
- `KV_REST_API_TOKEN` — Vercel KV auth (auto-set by Vercel)

Local dev with Vercel KV: run `vercel link` then `vercel env pull` to get env vars.

## Architecture

**Stack:** React 18 + Vite 5, deployed to Vercel with serverless API functions and Vercel KV (Redis) for persistence.

**Routing:** Client-side only via `useState` in `App.jsx` — no router library. The four views are `Hub`, `SetterLive`, `CloserLive`, and `DmAssist`.

### Frontend (`src/`)

- **`App.jsx`** — Top-level shell; manages which view is active
- **`Hub.jsx`** — Tool directory/home page; custom tools stored in `localStorage`
- **`SetterLive.jsx`** — EOD tracker for setters (Liz & Chantal); pipeline stages New DM → Opener Sent → Pain → Link Sent → Booked → Disq'd; persists data via `/api/setter`
- **`CloserLive.jsx`** — EOD dashboard for closer (JP); KPI tracking (Close Rate, One-Call Close, Show Rate); consumes booked leads fed from SetterLive via `feedCloserPipeline()`
- **`DmAssist.jsx`** — AI chat interface; proxies Claude through `/api/chat`; structured 3-layer output (Diagnosis / DM Response / Follow-up Path)
- **`shared/Charts.jsx`** — Custom div-based chart components (`BarChart`, `LineChart`, `ChartCard`, `Sparkline`); formatting utils (`fmtCount`, `fmtPct`, `fmtMoney`)
- **`shared/pipelineUtils.js`** — `feedCloserPipeline()` bridges setter → closer data

### Backend (`api/`)

- **`api/chat.js`** — Proxies requests to Anthropic API; default model `claude-sonnet-4-6`, max tokens 1500
- **`api/setter.js`** — Vercel KV GET/POST; 7-day TTL for non-pipeline keys

### Data persistence strategy

1. **Vercel KV** — primary store for pipeline and EOD metrics
2. **`localStorage`** — fallback if API unavailable; also stores Hub custom tool definitions
3. **React state** — ephemeral UI state only

### Styling

All styling is inline CSS or dynamic `<style>` tags injected in components. No CSS files or external UI library. Color system uses neon accents: `#00AAFF` (blue) and `#00FF88` (green).
