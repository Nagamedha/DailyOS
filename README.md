# DailyOS — Medha's Life Tracker

Personal tracker for Daily Activities, Exercise, Meals, and Finance.

## Quick Start (Local)

```bash
# 1. Navigate to this folder in Terminal
cd ~/Desktop/GetJOb/DailyOS

# 2. Install dependencies (first time only — takes ~30 seconds)
npm install

# 3. Start the app
npm run dev

# 4. Open in Chrome: http://localhost:5173
```

## Project Structure

```
DailyOS/
├── src/
│   ├── data/
│   │   └── categories.js     ← ✏️ Edit activity categories here
│   ├── utils/
│   │   ├── dateUtils.js       ← Date helpers
│   │   └── storage.js         ← localStorage (Phase 1) → Supabase (Phase 2)
│   ├── hooks/
│   │   └── useDailyLog.js     ← All Daily Log state logic
│   ├── components/
│   │   ├── Header.jsx         ← Sticky top bar + date navigation
│   │   ├── TabNav.jsx         ← 4-tab navigation
│   │   ├── DailyLog/          ← Daily activity log (complete)
│   │   ├── Exercise/          ← Exercise tracker (coming next)
│   │   ├── Meals/             ← Meal log (coming soon)
│   │   └── Finance/           ← Finance tracker (coming soon)
│   ├── App.jsx                ← Root component
│   └── App.css                ← Global styles + colour variables
├── index.html
├── vite.config.js
└── package.json
```

## How to Use the Daily Log

1. Select a date with the arrows in the header
2. Tap any activity row to expand/collapse the notes field
3. Use − and + buttons to log hours (0.5 hr increments)
4. Add notes per category and an overall day note at the bottom
5. Data auto-saves as you type
6. Click **Export for Claude** → paste the result in Cowork to get AI coaching

## Phase 2 (Supabase + Notion + Claude API)

When ready to deploy:
- Replace function bodies in `src/utils/storage.js` with Supabase API calls
- Add Python FastAPI backend in `/api` folder
- Deploy to Vercel

## Colour customisation

Edit the CSS variables at the top of `src/App.css` to change the colour scheme.
