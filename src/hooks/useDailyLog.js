import { useState, useEffect, useCallback, useRef } from 'react'
import { loadDayLog, saveDayLog, loadTimerStates, saveTimerStates } from '../utils/storage'
import { toDateStr } from '../utils/dateUtils'
import { CATEGORIES } from '../data/categories'

const CUSTOM_CATS_KEY = 'custom_categories'

function loadCustomCategories() {
  try { const r = localStorage.getItem(CUSTOM_CATS_KEY); return r ? JSON.parse(r) : [] }
  catch { return [] }
}
function saveCustomCategories(cats) { localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(cats)) }

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildEmptyDay(customCats = []) {
  const activities = {}
  ;[...CATEGORIES, ...customCats].forEach(cat => {
    activities[cat.id] = { hours: 0, notes: '', sessions: [], label: cat.label }
  })
  return { activities, deviationNote: '', mood: '' }
}

function fmtTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDailyLog(currentDate) {
  const dateStr = toDateStr(currentDate)

  const [customCats, setCustomCats] = useState(() => loadCustomCategories())

  const [dayData, setDayData] = useState(() => {
    const cc = loadCustomCategories()
    const saved = loadDayLog(dateStr)
    return saved ? normaliseLoadedData(saved, cc) : buildEmptyDay(cc)
  })

  const [saveStatus, setSaveStatus] = useState('saved')

  // Timer states: { [categoryId]: { startTimestamp, dateStr } | null }
  const [timerStates, setTimerStates] = useState(() => loadTimerStates())
  // Keep a ref so stopTimer can read the latest value synchronously
  const timerStatesRef = useRef(timerStates)
  useEffect(() => { timerStatesRef.current = timerStates }, [timerStates])

  // Orphaned timers: running on a different date than what's currently viewed
  const orphanedTimers = Object.entries(timerStates)
    .filter(([, s]) => s && s.dateStr !== dateStr)
    .map(([id, s]) => ({ categoryId: id, ...s }))

  // ── Load data when date changes ──────────────────────────────────────────
  useEffect(() => {
    const saved = loadDayLog(dateStr)
    setDayData(saved ? normaliseLoadedData(saved, customCats) : buildEmptyDay(customCats))
    setSaveStatus('saved')
  }, [dateStr]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist timer states ─────────────────────────────────────────────────
  useEffect(() => {
    saveTimerStates(timerStates)
  }, [timerStates])

  // ── Auto-save dayData (debounced 800ms) ──────────────────────────────────
  useEffect(() => {
    setSaveStatus('unsaved')
    const t = setTimeout(() => {
      saveDayLog(dateStr, dayData)
      setSaveStatus('saved')
    }, 800)
    return () => clearTimeout(t)
  }, [dateStr, dayData])

  // ── Hour / Notes updates ─────────────────────────────────────────────────

  const updateHours = useCallback((categoryId, hours) => {
    const clamped = Math.max(0, Math.min(24, Math.round(hours * 100) / 100))
    setDayData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [categoryId]: { ...prev.activities[categoryId], hours: clamped },
      },
    }))
  }, [])

  const updateNotes = useCallback((categoryId, notes) => {
    setDayData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [categoryId]: { ...prev.activities[categoryId], notes },
      },
    }))
  }, [])

  const updateDeviationNote = useCallback((note) => {
    setDayData(prev => ({ ...prev, deviationNote: note }))
  }, [])

  const updateMood = useCallback((mood) => {
    setDayData(prev => ({ ...prev, mood }))
  }, [])

  // ── Timer controls ───────────────────────────────────────────────────────

  const startTimer = useCallback((categoryId) => {
    setTimerStates(prev => ({
      ...prev,
      [categoryId]: { startTimestamp: Date.now(), dateStr },
    }))
  }, [dateStr])

  const stopTimer = useCallback((categoryId) => {
    const running = timerStatesRef.current[categoryId]
    if (!running) return

    setTimerStates(prev => ({ ...prev, [categoryId]: null }))

    const elapsed = Date.now() - running.startTimestamp
    const minutes = Math.max(1, Math.round(elapsed / 60000))
    const startDate = new Date(running.startTimestamp)
    const endDate = new Date()

    const session = {
      id: String(Date.now()),
      startTime: fmtTime(startDate),
      endTime: fmtTime(endDate),
      minutes,
    }

    setDayData(prev => {
      const act = prev.activities[categoryId]
      const newSessions = [...(act.sessions || []), session]
      const addedHours = Math.round((minutes / 60) * 100) / 100
      return {
        ...prev,
        activities: {
          ...prev.activities,
          [categoryId]: {
            ...act,
            sessions: newSessions,
            hours: Math.round((act.hours + addedHours) * 100) / 100,
          },
        },
      }
    })
  }, [])

  // Discard an orphaned timer without logging time
  const discardTimer = useCallback((categoryId) => {
    setTimerStates(prev => ({ ...prev, [categoryId]: null }))
  }, [])

  // Stop an orphaned timer and log the time to its original date
  const stopOrphanedTimer = useCallback((categoryId) => {
    const running = timerStatesRef.current[categoryId]
    if (!running) return

    setTimerStates(prev => ({ ...prev, [categoryId]: null }))

    const elapsed = Date.now() - running.startTimestamp
    const minutes = Math.max(1, Math.round(elapsed / 60000))
    const startDate = new Date(running.startTimestamp)
    const endDate = new Date()

    // Load that day's data, add the session, re-save
    const targetDateStr = running.dateStr
    const savedDay = loadDayLog(targetDateStr)
    const targetDay = savedDay ? normaliseLoadedData(savedDay) : buildEmptyDay()
    const act = targetDay.activities[categoryId]
    const session = {
      id: String(Date.now()),
      startTime: fmtTime(startDate),
      endTime: fmtTime(endDate),
      minutes,
    }
    const newSessions = [...(act.sessions || []), session]
    const addedHours = Math.round((minutes / 60) * 100) / 100
    targetDay.activities[categoryId] = {
      ...act,
      sessions: newSessions,
      hours: Math.round((act.hours + addedHours) * 100) / 100,
    }
    saveDayLog(targetDateStr, targetDay)

    // If viewing that date, reload it
    if (targetDateStr === dateStr) {
      setDayData(normaliseLoadedData(targetDay))
    }
  }, [dateStr])

  // ── Session CRUD ─────────────────────────────────────────────────────────

  const deleteSession = useCallback((categoryId, sessionId) => {
    setDayData(prev => {
      const act = prev.activities[categoryId]
      const session = (act.sessions || []).find(s => s.id === sessionId)
      if (!session) return prev
      const removedHours = Math.round((session.minutes / 60) * 100) / 100
      return {
        ...prev,
        activities: {
          ...prev.activities,
          [categoryId]: {
            ...act,
            sessions: act.sessions.filter(s => s.id !== sessionId),
            hours: Math.max(0, Math.round((act.hours - removedHours) * 100) / 100),
          },
        },
      }
    })
  }, [])

  const editSession = useCallback((categoryId, sessionId, newStart, newEnd, newMinutes) => {
    setDayData(prev => {
      const act = prev.activities[categoryId]
      const old = (act.sessions || []).find(s => s.id === sessionId)
      if (!old) return prev
      const hoursDiff = Math.round(((newMinutes - old.minutes) / 60) * 100) / 100
      return {
        ...prev,
        activities: {
          ...prev.activities,
          [categoryId]: {
            ...act,
            sessions: act.sessions.map(s =>
              s.id === sessionId ? { ...s, startTime: newStart, endTime: newEnd, minutes: newMinutes } : s
            ),
            hours: Math.max(0, Math.round((act.hours + hoursDiff) * 100) / 100),
          },
        },
      }
    })
  }, [])

  // ── Custom categories ─────────────────────────────────────────────────────

  const addCustomCategory = useCallback((cat) => {
    const id = 'custom_' + Date.now()
    const newCat = { ...cat, id }
    setCustomCats(prev => {
      const next = [...prev, newCat]
      saveCustomCategories(next)
      return next
    })
    setDayData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [id]: { hours: 0, notes: '', sessions: [], label: newCat.label },
      },
    }))
  }, [])

  const deleteCustomCategory = useCallback((id) => {
    setCustomCats(prev => {
      const next = prev.filter(c => c.id !== id)
      saveCustomCategories(next)
      return next
    })
    setDayData(prev => {
      const activities = { ...prev.activities }
      delete activities[id]
      return { ...prev, activities }
    })
  }, [])

  const resetActivity = useCallback((categoryId) => {
    setTimerStates(prev => ({ ...prev, [categoryId]: null }))
    setDayData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [categoryId]: { ...prev.activities[categoryId], sessions: [], hours: 0 },
      },
    }))
  }, [])

  // ── Derived stats ────────────────────────────────────────────────────────

  const totalHours = Object.values(dayData.activities).reduce(
    (sum, act) => sum + (act.hours || 0), 0
  )
  const allCats = [...CATEGORIES, ...customCats]
  const targetsHit = allCats.filter(cat => {
    const logged = dayData.activities[cat.id]?.hours || 0
    return cat.targetHours > 0 && logged >= cat.targetHours
  }).length
  const totalTargets = allCats.filter(cat => cat.targetHours > 0).length

  return {
    dayData,
    saveStatus,
    totalHours,
    targetsHit,
    totalTargets,
    timerStates,
    orphanedTimers,
    customCats,
    updateHours,
    updateNotes,
    updateDeviationNote,
    updateMood,
    startTimer,
    stopTimer,
    discardTimer,
    stopOrphanedTimer,
    deleteSession,
    editSession,
    resetActivity,
    addCustomCategory,
    deleteCustomCategory,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL
// ─────────────────────────────────────────────────────────────────────────────

function normaliseLoadedData(saved, customCats = []) {
  const activities = { ...(saved.activities || {}) }
  ;[...CATEGORIES, ...customCats].forEach(cat => {
    if (!activities[cat.id]) {
      activities[cat.id] = { hours: 0, notes: '', sessions: [], label: cat.label }
    } else {
      if (!activities[cat.id].sessions) activities[cat.id].sessions = []
    }
  })
  return {
    activities,
    deviationNote: saved.deviationNote || '',
    mood: saved.mood || '',
  }
}
