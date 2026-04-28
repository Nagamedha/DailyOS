// ─────────────────────────────────────────────────────────────────────────────
// storage.js — Data persistence layer
//
// ⚡ DESIGN PRINCIPLE (Dependency Inversion):
//    All other code calls ONLY the functions exported from this file.
//    No component or hook ever calls localStorage directly.
//
//    Phase 1 (now):   localStorage — works offline, no server needed
//    Phase 2 (later): Replace function bodies with Supabase API calls.
//                     The rest of the codebase changes NOTHING.
//
// DATA SHAPE — Daily Log:
// {
//   "2026-04-25": {
//     activities: {
//       study:    { hours: 5.5, notes: "Focused on React" },
//       jobs:     { hours: 1.0, notes: "Applied to Google" },
//       ...
//     },
//     deviationNote: "Skipped gym, did home workout instead",
//     mood: "good",
//     savedAt: "2026-04-25T22:30:00Z"
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────

// Internal key names used in localStorage.
// ⚠️  Do NOT change these after you have data — it will break existing entries.
const STORAGE_KEYS = {
  DAILY_LOG:   'dailyos_daily_log',   // all daily log entries (keyed by date)
  EXERCISE:    'dailyos_exercise',    // exercise sessions
  MEALS:       'dailyos_meals',       // meal log entries
  FINANCE:     'dailyos_finance',     // monthly finance entries
  TIMER_STATE: 'dailyos_timer_states', // running timer state per category
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY LOG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load all daily log entries as one object keyed by "YYYY-MM-DD".
 * Returns empty object if nothing is saved yet.
 */
export function loadAllDailyLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOG)
    return raw ? JSON.parse(raw) : {}
  } catch {
    // If localStorage data got corrupted somehow, start fresh
    console.warn('DailyOS: could not parse daily log from storage, starting fresh.')
    return {}
  }
}

/**
 * Load the log entry for a single specific day.
 * @param {string} dateStr — "YYYY-MM-DD"
 * @returns {object | null} — the day's data, or null if nothing saved yet
 */
export function loadDayLog(dateStr) {
  const all = loadAllDailyLogs()
  return all[dateStr] ?? null
}

/**
 * Save a single day's log entry.
 * Merges into the existing data (does not wipe other days).
 * @param {string} dateStr — "YYYY-MM-DD"
 * @param {object} dayData — { activities, deviationNote, mood }
 */
export function saveDayLog(dateStr, dayData) {
  const all = loadAllDailyLogs()
  all[dateStr] = {
    ...dayData,
    savedAt: new Date().toISOString(), // audit trail: when was this saved?
  }
  localStorage.setItem(STORAGE_KEYS.DAILY_LOG, JSON.stringify(all))
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT FOR CLAUDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a formatted text export of all logged data.
 * Copy-paste this into Cowork to ask Claude questions about your patterns.
 *
 * @param {number} [lastNDays=14] — how many days to include (default: last 14 days)
 * @returns {string} — human-readable export text
 */
export function exportForClaude(lastNDays = 14) {
  const all = loadAllDailyLogs()
  const allDates = Object.keys(all).sort().reverse() // most recent first

  if (allDates.length === 0) {
    return 'No DailyOS data has been logged yet.'
  }

  // Limit to the requested number of days
  const dates = allDates.slice(0, lastNDays)

  const lines = [
    'DailyOS — Activity Export',
    `Generated: ${new Date().toLocaleString()}`,
    '='.repeat(40),
    '',
  ]

  dates.forEach(date => {
    const entry = all[date]
    lines.push(`📅 ${date}`)
    lines.push('─'.repeat(30))

    // Activities with hours > 0
    if (entry.activities) {
      const logged = Object.entries(entry.activities).filter(
        ([, data]) => data.hours > 0
      )
      if (logged.length > 0) {
        logged.forEach(([id, data]) => {
          const note = data.notes ? ` — "${data.notes}"` : ''
          lines.push(`  ${data.label || id}: ${data.hours} hrs${note}`)
        })
      } else {
        lines.push('  (nothing logged this day)')
      }
    }

    // Total hours for the day
    const totalHours = Object.values(entry.activities || {}).reduce(
      (sum, a) => sum + (a.hours || 0),
      0
    )
    lines.push(`  ⏱  Total logged: ${totalHours.toFixed(1)} hrs`)

    // Deviation note
    if (entry.deviationNote) {
      lines.push(`  📝 Note: ${entry.deviationNote}`)
    }

    // Mood
    if (entry.mood) {
      lines.push(`  😊 Mood: ${entry.mood}`)
    }

    lines.push('')
  })

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMER STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load all running timer states.
 * Shape: { [categoryId]: { startTimestamp: number, dateStr: string } | null }
 */
export function loadTimerStates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_STATE)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Persist the full timer states map.
 * @param {object} states
 */
export function saveTimerStates(states) {
  localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(states))
}

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE (placeholder — to be expanded when Exercise tab is built)
// ─────────────────────────────────────────────────────────────────────────────

export function loadExerciseLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISE)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveExerciseLog(dateStr, data) {
  const all = loadExerciseLogs()
  all[dateStr] = { ...data, savedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.EXERCISE, JSON.stringify(all))
}

// ─────────────────────────────────────────────────────────────────────────────
// MEALS (placeholder — to be expanded when Meals tab is built)
// ─────────────────────────────────────────────────────────────────────────────

export function loadMealLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveMealLog(dateStr, data) {
  const all = loadMealLogs()
  all[dateStr] = { ...data, savedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(all))
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE (placeholder — to be expanded when Finance tab is built)
// ─────────────────────────────────────────────────────────────────────────────

export function loadFinanceLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveFinanceLog(monthStr, data) {
  // monthStr format: "YYYY-MM" (e.g. "2026-04")
  const all = loadFinanceLogs()
  all[monthStr] = { ...data, savedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(all))
}
