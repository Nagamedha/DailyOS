const RATE_KEY = 'fx_rate_usd_inr'
const RATE_TS_KEY = 'fx_rate_ts'
const CACHE_MS = 4 * 60 * 60 * 1000 // 4 hours

export async function getUsdToInr() {
  const cached = localStorage.getItem(RATE_KEY)
  const ts = localStorage.getItem(RATE_TS_KEY)
  if (cached && ts && Date.now() - Number(ts) < CACHE_MS) return Number(cached)
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await res.json()
    const rate = data.rates?.INR || 84
    localStorage.setItem(RATE_KEY, String(rate))
    localStorage.setItem(RATE_TS_KEY, String(Date.now()))
    return rate
  } catch {
    return cached ? Number(cached) : 84
  }
}

export function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export function fmtUSD(n) {
  return '$' + n.toFixed(2)
}
