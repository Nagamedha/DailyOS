# DailyOS — Personal Health & Productivity Tracker

A mobile-first personal dashboard for tracking exercise, meals, daily habits, finance, journal, and getting AI coaching — all in one place, offline-first, no account needed.

**Live:** [daily-os-omega.vercel.app](https://daily-os-omega.vercel.app)

---

## What It Does

| Tab | What you track |
|-----|----------------|
| 📋 **Daily Log** | Sleep, study, work, gym hours · mood · daily routines · custom activity categories |
| 💪 **Exercise** | Day A/B/C/D workout plans · per-exercise timers · walk timers · session timer · reorder exercises · add from library or create custom |
| 🥗 **Meals** | Breakfast / lunch / dinner options · supplements with avoid-notes · custom meal codes (BF5, L11 etc.) · macro tracking |
| 💰 **Finance** | Daily income & expense logging · categories · running balance |
| 📓 **Journal** | Free-write diary with photo attachments (stored in browser IndexedDB) |
| 📊 **Analytics** | Weekly summaries across all tabs |
| 🤖 **AI Coach** | Chat with your own OpenAI or Anthropic key · gets 14 days of your logged data as context · asks about sleep, streaks, study targets |

Everything saves automatically to your **browser's localStorage** — no login, no server, no cloud.

---

## Why the API Key is in the UI (not in .env)

The AI Coach uses **your own API key** (OpenAI or Anthropic), not a shared app key. This is intentional:

- If the developer's key was in `.env`, every user of the app would share it → the bill goes to one person
- Each person pastes their own key → they control their own usage and cost
- The key is stored in **your browser's localStorage only** — it never leaves your device, never touches a server
- Nobody else can see your localStorage; it is private to your browser session

This is the same pattern used by tools like ChatGPT's API Playground and many open-source AI tools.

When Supabase auth is added (Phase 2), keys can be tied to user accounts and stored encrypted server-side if needed.

---

## How Others Can Use This

### Option 1 — Use the live app
Go to [daily-os-omega.vercel.app](https://daily-os-omega.vercel.app) — works instantly, no setup.

### Option 2 — Run locally and customise

```bash
# 1. Clone the repo
git clone https://github.com/Nagamedha/DailyOS.git
cd DailyOS

# 2. Install dependencies (Node 18+ required)
npm install

# 3. Start dev server
npm run dev
# Opens at http://localhost:5173

# 4. Build for production
npm run build
```

Customise your own workout plans in `src/data/exercises.js`, meal options in `src/data/meals.js`, and activity categories in `src/data/categories.js`.

---

## Folder Structure

```
DailyOS/
├── index.html                     ← App entry point
├── vite.config.js                 ← Vite build config
├── package.json                   ← Dependencies
│
└── src/
    ├── App.jsx                    ← Root: tab routing, date state
    ├── App.css                    ← Global CSS variables (colours, fonts, spacing)
    ├── main.jsx                   ← React DOM mount
    │
    ├── components/
    │   ├── Header.jsx / .css      ← Top bar: app name + date navigation arrows
    │   ├── TabNav.jsx / .css      ← Bottom 7-tab navigation bar
    │   │
    │   ├── DailyLog/
    │   │   ├── DailyLog.jsx       ← Main daily log: activities, mood, routines
    │   │   ├── DailyLog.css
    │   │   ├── ActivityRow.jsx    ← Single expandable activity row with hour +/−
    │   │   └── DaySummary.jsx     ← Mood selector with descriptions
    │   │
    │   ├── Exercise/
    │   │   ├── Exercise.jsx       ← Day types, phase groups, walk cards, session timer
    │   │   └── Exercise.css       ← All exercise UI styles
    │   │
    │   ├── Meals/
    │   │   ├── Meals.jsx          ← Meal sections (BF/L/D), supplements, custom options
    │   │   └── Meals.css
    │   │
    │   ├── Finance/
    │   │   ├── Finance.jsx        ← Income/expense log with categories
    │   │   └── Finance.css
    │   │
    │   ├── Journal/
    │   │   ├── Journal.jsx        ← Daily diary with photo upload
    │   │   └── Journal.css
    │   │
    │   ├── Analytics/
    │   │   ├── Analytics.jsx      ← Weekly stats pulled from all tab data
    │   │   └── Analytics.css
    │   │
    │   └── Chat/
    │       ├── Chat.jsx           ← AI coach: dual OpenAI/Anthropic support
    │       └── Chat.css
    │
    ├── hooks/
    │   ├── useDailyLog.js         ← All daily log state + localStorage persistence
    │   ├── useExercise.js         ← Exercise state: timers, ordering, custom exercises
    │   ├── useMeals.js            ← Meals state + custom meal options
    │   ├── useFinance.js          ← Finance entries state
    │   └── useJournal.js          ← Journal entries + IndexedDB for photos
    │
    ├── data/
    │   ├── exercises.js           ← ✏️ Workout plans (Days A/B/C/D) + 35-exercise library
    │   ├── meals.js               ← ✏️ Meal options, supplement list, avoid-notes
    │   └── categories.js          ← ✏️ Default daily activity categories
    │
    └── utils/
        ├── dateUtils.js           ← toDateStr(), date formatting helpers
        ├── storage.js             ← exportForClaude() — bundles 14 days of data for AI
        ├── currency.js            ← Currency formatting
        └── indexedDB.js           ← Photo storage for journal (browser IndexedDB)
```

---

## Customising for Your Own Use

| What to change | Where |
|----------------|-------|
| Workout plans (exercises, sets, weight) | `src/data/exercises.js` → `DAYS` object |
| Exercise library (35 presets) | `src/data/exercises.js` → `EXERCISE_LIBRARY` |
| Meal options (BF/L/D codes) | `src/data/meals.js` → `MEAL_OPTIONS` |
| Supplements + avoid rules | `src/data/meals.js` → `SUPPLEMENTS` |
| Activity categories (icons, colours, targets) | `src/data/categories.js` or add via UI |
| Colour scheme | `src/App.css` → CSS variables at top of file |

---

## Current Limitations

- **Single user only** — all data stored in the browser; no accounts or sync between devices
- **No cloud backup** — clearing browser data or switching devices loses all history
- **localStorage cap** — browsers typically allow 5–10 MB; very heavy use (years of data + many photos) may hit limits
- **Photos in IndexedDB** — journal photos stay in that browser only; no export
- **AI Coach cost** — uses your own API key; each conversation costs a few cents
- **Offline works, but no PWA** — the app loads from Vercel; a full offline/PWA mode isn't set up yet
- **No data export** — aside from the "Export for Claude" context dump, there's no CSV/JSON export yet

---

## Planned Future Improvements

### Phase 2 — Supabase Backend
- User accounts (email / Google login)
- All data synced to Supabase Postgres — access from any device
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- Replace `localStorage` calls in `src/utils/storage.js` with Supabase client calls

### Phase 3 — UX & Features
- PWA / install to home screen with offline support
- Data export (CSV, JSON)
- Streak tracking and badges
- Notification reminders (walk, supplement, water)
- Graphs and trend charts in Analytics
- Dark mode toggle

### Phase 4 — Scaling
- Password protection / private mode
- Shared household view (e.g., family meal planning)
- Integration with wearables (Apple Health, Google Fit)
- AI Coach memory — remembers past advice and tracks goal progress over time

---

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 18 + Vite 5 |
| Styling | Plain CSS with CSS variables (no Tailwind) |
| State | React hooks + localStorage |
| Photos | Browser IndexedDB |
| AI | OpenAI GPT-4o-mini or Anthropic Claude Haiku (user's own key) |
| Hosting | Vercel (free tier) |
| Database | _None yet — Phase 2 will add Supabase_ |

---

## Deploy Your Own Copy

1. Fork this repo on GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your fork
3. Framework: **Vite** (auto-detected)
4. No environment variables needed
5. Click Deploy → live in ~1 minute

---

## Contributing / Local Dev Notes

- Node 18 or 20 required (Vite 5 needs `crypto.getRandomValues`)
- No `.env` file needed to run locally
- All data files to customise are in `src/data/` — plain JS objects, easy to edit
- Hooks in `src/hooks/` follow the pattern: one hook per tab, returns state + actions
- When adding a new tab: add to `TABS` in `App.jsx`, add entry in `TabNav.jsx`, create component + hook

---

*Built with React + Vite · Hosted on Vercel · Data stays in your browser*
