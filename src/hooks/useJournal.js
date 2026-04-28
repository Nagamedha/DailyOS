import { useState, useEffect, useCallback } from 'react'
import { toDateStr } from '../utils/dateUtils'

const PREFIX = 'journal_'

function buildEmpty() {
  return { mood: null, entries: [], affirmationIdx: null }
}

function ls(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

export function useJournal(currentDate) {
  const dateStr = toDateStr(currentDate)
  const [data, setData] = useState(() => ls(PREFIX + dateStr) || buildEmpty())

  useEffect(() => { setData(ls(PREFIX + dateStr) || buildEmpty()) }, [dateStr])
  useEffect(() => { ss(PREFIX + dateStr, data) }, [dateStr, data])

  const setMood = useCallback((mood) => {
    setData(prev => ({ ...prev, mood }))
  }, [])

  const setAffirmationIdx = useCallback((idx) => {
    setData(prev => ({ ...prev, affirmationIdx: idx }))
  }, [])

  const addEntry = useCallback((text, imageId = null) => {
    const id = 'entry_' + Date.now()
    const time = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    setData(prev => ({
      ...prev,
      entries: [...prev.entries, { id, text, imageId, time, ts: Date.now() }]
    }))
  }, [])

  const deleteEntry = useCallback((id) => {
    setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }))
  }, [])

  const updateEntry = useCallback((id, text) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, text } : e)
    }))
  }, [])

  function getRecentMoods(days = 7) {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = toDateStr(d)
      const j = ls(PREFIX + ds)
      result.push({ date: ds, mood: j?.mood || null })
    }
    return result
  }

  return {
    data, dateStr,
    setMood, setAffirmationIdx,
    addEntry, deleteEntry, updateEntry,
    getRecentMoods,
  }
}
