import { useState, useEffect, useCallback } from 'react'
import { toDateStr } from '../utils/dateUtils'

const PREFIX = 'finance_'
const SETTINGS_KEY = 'finance_settings'

function ls(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

export function useFinance(currentDate) {
  const dateStr = toDateStr(currentDate)
  const [txns, setTxns]       = useState(() => ls(PREFIX + dateStr) || [])
  const [settings, setSettings] = useState(() => ls(SETTINGS_KEY) || { baseCurrency: 'INR', exchangeRate: 84 })

  useEffect(() => { setTxns(ls(PREFIX + dateStr) || []) }, [dateStr])
  useEffect(() => { ss(PREFIX + dateStr, txns) }, [dateStr, txns])
  useEffect(() => { ss(SETTINGS_KEY, settings) }, [settings])

  const addTxn = useCallback((txn) => {
    const id = 'txn_' + Date.now()
    const time = new Date().toTimeString().slice(0, 5)
    setTxns(prev => [...prev, { ...txn, id, time }])
  }, [])

  const deleteTxn = useCallback((id) => {
    setTxns(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateRate = useCallback((rate) => {
    setSettings(prev => ({ ...prev, exchangeRate: rate }))
  }, [])

  const toggleBaseCurrency = useCallback(() => {
    setSettings(prev => ({ ...prev, baseCurrency: prev.baseCurrency === 'INR' ? 'USD' : 'INR' }))
  }, [])

  function toBase(amount, currency) {
    const { baseCurrency, exchangeRate } = settings
    if (currency === baseCurrency) return amount
    if (baseCurrency === 'INR') return amount * exchangeRate
    return amount / exchangeRate
  }

  const totalToday = txns.reduce((sum, t) => sum + toBase(t.amount, t.currency), 0)

  function getMonthTxns(month /* YYYY-MM */) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX) && k.slice(PREFIX.length, PREFIX.length + 7) === month)
    return keys.flatMap(k => { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } })
  }

  return {
    txns, settings, totalToday,
    addTxn, deleteTxn, updateRate, toggleBaseCurrency, toBase, getMonthTxns,
  }
}
