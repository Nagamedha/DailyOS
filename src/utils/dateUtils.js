// ─────────────────────────────────────────────────────────────────────────────
// dateUtils.js — Date helper functions
//
// All date logic lives here so it is easy to find and change.
// Components import what they need — they never manipulate dates directly.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a Date object to "YYYY-MM-DD" string.
 * This format is used as the key in localStorage and Supabase.
 * Example: new Date() → "2026-04-25"
 */
export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Format a date for display in the header.
 * Example: "Thu, Apr 25"
 */
export function toDisplayDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date as a longer readable string.
 * Example: "Thursday, April 25, 2026"
 */
export function toLongDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Return a new Date one day before the given date.
 * Does NOT mutate the original date.
 */
export function prevDay(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - 1)
  return d
}

/**
 * Return a new Date one day after the given date.
 * Does NOT mutate the original date.
 */
export function nextDay(date) {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d
}

/**
 * Check if a date is today.
 */
export function isToday(date) {
  return toDateStr(date) === toDateStr(new Date())
}

/**
 * Check if a date is strictly in the future (after today).
 * Used to prevent logging future days.
 */
export function isFuture(date) {
  return toDateStr(date) > toDateStr(new Date())
}

/**
 * Get the name of the day (e.g. "Monday").
 */
export function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}
