import React, { useState, useMemo } from 'react'
import { toDateStr } from '../../utils/dateUtils'
import { FINANCE_CATEGORIES, MOODS } from '../../data/meals'
import { fmtINR, fmtUSD } from '../../utils/currency'
import { loadAllDailyLogs } from '../../utils/storage'
import './Analytics.css'

function getDatesBack(days) {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    dates.push(d)
  }
  return dates
}

function getDatesRange(fromStr, toStr) {
  const dates = []
  const from = new Date(fromStr + 'T00:00:00')
  const to   = new Date(toStr   + 'T00:00:00')
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }
  return dates
}

function todayStr() {
  return toDateStr(new Date())
}

function ls(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }

function dayLabel(d) {
  return d.toLocaleDateString('en-AU', { weekday: 'short' }).slice(0, 1)
}

// Activity colors for bar chart
const ACTIVITY_COLORS = {
  study:    '#5a4e88',
  jobs:     '#3d6b47',
  exercise: '#c05a30',
  cook:     '#8a6a30',
  family:   '#e07070',
  chores:   '#718096',
  relax:    '#4a90c4',
  sleep:    '#2d3748',
}

const STREAK_ACTIVITIES = [
  { id: 'study',    icon: '📚', label: 'Study' },
  { id: 'jobs',     icon: '💼', label: 'Jobs' },
  { id: 'exercise', icon: '🏋️', label: 'Exercise' },
]

function computeStreak(allLogs, activityId) {
  // Walk backwards from today until we find a day with no hours
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = toDateStr(d)
    const entry = allLogs[ds]
    const hours = entry?.activities?.[activityId]?.hours || 0
    if (hours > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default function Analytics() {
  const [period, setPeriod]         = useState('week')
  const [customFrom, setCustomFrom] = useState(todayStr())
  const [customTo,   setCustomTo]   = useState(todayStr())

  // Resolve dates based on period
  const dates = useMemo(() => {
    if (period === 'today')   return getDatesBack(1)
    if (period === 'week')    return getDatesBack(7)
    if (period === 'month')   return getDatesBack(30)
    if (period === 'thismonth') {
      const now = new Date()
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      const result = []
      for (let d = new Date(first); d <= now; d.setDate(d.getDate() + 1)) {
        result.push(new Date(d))
      }
      return result
    }
    if (period === 'custom') {
      if (customFrom && customTo && customFrom <= customTo) {
        return getDatesRange(customFrom, customTo)
      }
      return getDatesBack(7) // fallback
    }
    return getDatesBack(7)
  }, [period, customFrom, customTo])

  const days = dates.length

  // Gather data across dates
  const dayData = useMemo(() => dates.map(d => {
    const ds = toDateStr(d)
    return {
      date: d, ds,
      exercise: ls('exercise_' + ds),
      meals:    ls('meals_' + ds),
      finance:  ls('finance_' + ds) || [],
      journal:  ls('journal_' + ds),
    }
  }), [dates])

  // ── All daily logs (for streaks & hours chart) ──
  const allDailyLogs = useMemo(() => loadAllDailyLogs(), [])

  // ── Activity hours per day (for bar chart) ──
  const hoursPerDay = useMemo(() => dates.map(d => {
    const ds   = toDateStr(d)
    const entry = allDailyLogs[ds]
    const activities = entry?.activities || {}
    return { ds, date: d, activities }
  }), [dates, allDailyLogs])

  // Max total hours across days (for SVG scaling)
  const maxDayHours = useMemo(() => {
    return Math.max(
      1,
      ...hoursPerDay.map(({ activities }) =>
        Object.values(activities).reduce((s, a) => s + (a?.hours || 0), 0)
      )
    )
  }, [hoursPerDay])

  // ── Streaks ──
  const streaks = useMemo(() =>
    STREAK_ACTIVITIES.map(a => ({
      ...a,
      streak: computeStreak(allDailyLogs, a.id),
    }))
  , [allDailyLogs])

  // ── Exercise stats ──
  const gymDays = dayData.filter(d => {
    const ex = d.exercise
    if (!ex) return false
    const allEx = Object.values(ex.exercises || {})
    return allEx.filter(e => e.done).length > 0
  }).length

  const walkData = dayData.map(d => {
    const walks = d.exercise?.walks || []
    return walks.filter(w => w.done).length
  })
  const avgWalks = walkData.length ? (walkData.reduce((a, b) => a + b, 0) / walkData.length).toFixed(1) : '0'

  // ── Supplement stats ──
  const suppDays = dayData.filter(d => {
    const supps = d.meals?.supplements || {}
    const taken = Object.values(supps).filter(s => s.taken).length
    return taken >= 3
  }).length

  // ── Meal stats ──
  const mealDays = dayData.filter(d => {
    const m = d.meals
    if (!m) return false
    return ['breakfast', 'lunch', 'dinner'].filter(k => m[k]?.code || m[k]?.custom).length >= 2
  }).length

  // ── Finance ──
  const settings = ls('finance_settings') || { baseCurrency: 'INR', exchangeRate: 84 }
  const { baseCurrency, exchangeRate } = settings

  function toBase(amount, currency) {
    if (currency === baseCurrency) return amount
    if (baseCurrency === 'INR') return amount * exchangeRate
    return amount / exchangeRate
  }

  const allTxns = dayData.flatMap(d => d.finance)
  const financeByCat = {}
  allTxns.forEach(t => {
    const b = toBase(t.amount, t.currency)
    financeByCat[t.category] = (financeByCat[t.category] || 0) + b
  })
  const financeTotal = Object.values(financeByCat).reduce((a, b) => a + b, 0)
  const finCats = Object.entries(financeByCat).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const display = (n) => baseCurrency === 'INR' ? fmtINR(n) : fmtUSD(n)

  // ── Mood trend ──
  const moods = dayData.map(d => ({ d, mood: d.journal?.mood || null }))
  const moodValues = moods.filter(m => m.mood).map(m => m.mood)
  const avgMood = moodValues.length ? (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1) : null

  // ── Cross-tab insight: gym vs mood ──
  const gymMoods = dayData.filter(d => {
    const allEx = Object.values(d.exercise?.exercises || {})
    return allEx.filter(e => e.done).length > 0
  }).map(d => d.journal?.mood).filter(Boolean)

  const restMoods = dayData.filter(d => {
    const allEx = Object.values(d.exercise?.exercises || {})
    return allEx.filter(e => e.done).length === 0
  }).map(d => d.journal?.mood).filter(Boolean)

  const avgGymMood  = gymMoods.length  ? (gymMoods.reduce((a,b) => a+b,0) / gymMoods.length).toFixed(1) : null
  const avgRestMood = restMoods.length ? (restMoods.reduce((a,b) => a+b,0) / restMoods.length).toFixed(1) : null

  // ── Heatmap colours ──
  function heatColor(d) {
    const ex = d.exercise
    const meals = d.meals
    const exDone = ex ? Object.values(ex.exercises || {}).filter(e => e.done).length : 0
    const mealsDone = meals ? ['breakfast','lunch','dinner'].filter(k => meals[k]?.code || meals[k]?.custom).length : 0
    const suppsDone = meals ? Object.values(meals.supplements || {}).filter(s => s.taken).length : 0
    const score = exDone + mealsDone + suppsDone
    if (score === 0) return '#e2e8f0'
    if (score < 4)  return '#a8d4ac'
    if (score < 8)  return '#5a9e6f'
    return '#2d6a4f'
  }

  // ── Bar chart SVG ──
  const BAR_W    = 18
  const BAR_GAP  = 6
  const CHART_H  = 80
  const svgWidth = Math.max(200, hoursPerDay.length * (BAR_W + BAR_GAP))

  function renderBarChart() {
    // Collect all unique activity IDs that appear
    const actIds = Array.from(
      new Set(hoursPerDay.flatMap(({ activities }) => Object.keys(activities)))
    ).filter(id => ACTIVITY_COLORS[id])

    return (
      <svg
        width={svgWidth}
        height={CHART_H + 20}
        className="an-hours-chart-svg"
        style={{ display: 'block', minWidth: svgWidth }}
      >
        {hoursPerDay.map(({ ds, date, activities }, i) => {
          const totalH = Object.values(activities).reduce((s, a) => s + (a?.hours || 0), 0)
          const barHeight = totalH > 0 ? (totalH / maxDayHours) * CHART_H : 0
          const x = i * (BAR_W + BAR_GAP)

          // Stack segments by activity
          let yOffset = CHART_H
          const segments = actIds
            .map(id => {
              const h = activities[id]?.hours || 0
              const segH = totalH > 0 ? (h / maxDayHours) * CHART_H : 0
              return { id, segH }
            })
            .filter(s => s.segH > 0)

          return (
            <g key={ds}>
              {/* Stack segments bottom-up */}
              {segments.map(({ id, segH }) => {
                yOffset -= segH
                const yPos = yOffset
                return (
                  <rect
                    key={id}
                    x={x}
                    y={yPos}
                    width={BAR_W}
                    height={segH}
                    fill={ACTIVITY_COLORS[id] || '#94a3b8'}
                    rx={2}
                  >
                    <title>{`${date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} — ${id}: ${activities[id]?.hours || 0}h`}</title>
                  </rect>
                )
              })}
              {/* Day label */}
              <text
                x={x + BAR_W / 2}
                y={CHART_H + 14}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {dayLabel(date)}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  // ── Streak badge color ──
  function streakColor(n) {
    if (n >= 3) return 'green'
    if (n >= 1) return 'amber'
    return 'grey'
  }

  const hasAnyData = gymDays > 0 || mealDays > 0 || finCats.length > 0 || moods.some(m => m.mood)

  return (
    <div className="an-wrap">
      {/* Period / date range */}
      <div className="an-date-range">
        <div className="an-period">
          {[
            ['today',     'Today'],
            ['week',      'Last 7'],
            ['month',     'Last 30'],
            ['thismonth', 'This Month'],
            ['custom',    'Custom'],
          ].map(([k, l]) => (
            <button
              key={k}
              className={`an-period-btn${period === k ? ' active' : ''}`}
              onClick={() => setPeriod(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="an-custom-range">
            <label className="an-date-input-label">From</label>
            <input
              type="date"
              className="an-date-input"
              value={customFrom}
              max={customTo || todayStr()}
              onChange={e => setCustomFrom(e.target.value)}
            />
            <label className="an-date-input-label">To</label>
            <input
              type="date"
              className="an-date-input"
              value={customTo}
              min={customFrom}
              max={todayStr()}
              onChange={e => setCustomTo(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="an-stats-grid">
        <div className={`an-stat-card${gymDays > days * 0.5 ? ' highlight' : ''}`}>
          <div className="an-stat-icon">🏋️</div>
          <div className="an-stat-value">{gymDays}<span style={{fontSize:14}}> /{days}</span></div>
          <div className="an-stat-label">Workout days</div>
        </div>
        <div className={`an-stat-card${Number(avgWalks) >= 2 ? ' highlight' : ''}`}>
          <div className="an-stat-icon">🚶</div>
          <div className="an-stat-value">{avgWalks}</div>
          <div className="an-stat-label">Avg walks / day</div>
        </div>
        <div className={`an-stat-card${mealDays > days * 0.6 ? ' highlight' : ''}`}>
          <div className="an-stat-icon">🍽️</div>
          <div className="an-stat-value">{mealDays}<span style={{fontSize:14}}> /{days}</span></div>
          <div className="an-stat-label">Meals logged</div>
        </div>
        <div className={`an-stat-card${suppDays > days * 0.7 ? ' highlight' : ''}`}>
          <div className="an-stat-icon">💊</div>
          <div className="an-stat-value">{suppDays}<span style={{fontSize:14}}> /{days}</span></div>
          <div className="an-stat-label">Supplement days (3+)</div>
        </div>
      </div>

      {/* Activity streaks */}
      <div className="an-card">
        <div className="an-card-title">Streaks</div>
        <div className="an-streaks">
          {streaks.map(({ id, icon, label, streak }) => (
            <div key={id} className={`an-streak-badge an-streak-${streakColor(streak)}`}>
              <div className="an-streak-icon">{icon}</div>
              <div className="an-streak-value">{streak}</div>
              <div className="an-streak-label">{label}</div>
              <div className="an-streak-unit">{streak === 1 ? 'day' : 'days'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily hours bar chart */}
      {hoursPerDay.some(({ activities }) =>
        Object.values(activities).some(a => a?.hours > 0)
      ) && (
        <div className="an-card">
          <div className="an-card-title">Daily Hours Breakdown</div>
          <div className="an-hours-chart">
            {renderBarChart()}
          </div>
          {/* Legend */}
          <div className="an-hours-legend">
            {Object.entries(ACTIVITY_COLORS).map(([id, color]) => (
              <div key={id} className="an-hours-legend-item">
                <span className="an-hours-legend-dot" style={{ background: color }} />
                <span>{id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consistency heatmap */}
      <div className="an-card">
        <div className="an-card-title">Daily consistency</div>
        <div className="an-heatmap">
          {dayData.map((d, i) => (
            <div key={d.ds} className="an-heat-col">
              <div className="an-heat-label">{dayLabel(d.date)}</div>
              <div
                className="an-heat-day"
                style={{ background: heatColor(d) }}
                title={d.ds}
              >
                {d.exercise?.walks?.filter(w => w.done).length > 0 && (
                  <div className="an-heat-dot" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Colour = activity level (exercise + meals + supplements) · dot = walks done
        </div>
      </div>

      {/* Mood trend */}
      {moods.some(m => m.mood) && (
        <div className="an-card">
          <div className="an-card-title">
            Mood trend {avgMood && `· avg ${avgMood} ${MOODS.find(m => m.value === Math.round(Number(avgMood)))?.emoji || ''}`}
          </div>
          <div className="an-mood-row">
            {moods.map(({ d, mood }, i) => {
              const pct = mood ? (mood / 5) * 100 : 0
              const emoji = MOODS.find(m => m.value === mood)?.emoji
              return (
                <div key={d.ds} className="an-mood-bar-wrap">
                  {emoji && <div className="an-mood-bar-emoji">{emoji}</div>}
                  <div
                    className="an-mood-bar"
                    style={{
                      height: pct + '%',
                      background: mood >= 4 ? 'var(--color-primary)' : mood >= 3 ? '#f59e0b' : mood ? '#ef4444' : 'var(--color-border)',
                      minHeight: mood ? 4 : 0,
                    }}
                  />
                  <div className="an-mood-bar-label">{dayLabel(d.date)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cross-tab insights */}
      {(avgGymMood || avgRestMood || gymDays > 0) && (
        <div className="an-card">
          <div className="an-card-title">Insights</div>
          {avgGymMood && avgRestMood && (
            <div className="an-insight">
              <span className="an-insight-icon">💡</span>
              <div className="an-insight-text">
                Your average mood on <strong>workout days is {avgGymMood}</strong> vs <strong>{avgRestMood} on rest days</strong>. Exercise is {Number(avgGymMood) > Number(avgRestMood) ? 'boosting' : 'not yet visibly lifting'} your mood.
              </div>
            </div>
          )}
          {gymDays < days * 0.5 && (
            <div className="an-insight">
              <span className="an-insight-icon">🏋️</span>
              <div className="an-insight-text">
                <strong>{gymDays} of {days} days</strong> with exercise logged. Aim for at least {Math.ceil(days * 0.6)} days this period.
              </div>
            </div>
          )}
          {suppDays < days * 0.7 && (
            <div className="an-insight">
              <span className="an-insight-icon">💊</span>
              <div className="an-insight-text">
                Supplements logged on <strong>{suppDays} days</strong>. The Folic + DHA prenatal must be taken <strong>every single night</strong> — consistency matters most here.
              </div>
            </div>
          )}
          {Number(avgWalks) < 2 && (
            <div className="an-insight">
              <span className="an-insight-icon">🚶</span>
              <div className="an-insight-text">
                Average <strong>{avgWalks} walks/day</strong>. Target is 3 walks (after breakfast, lunch, dinner) — walks manage blood sugar (HbA1c 5.7).
              </div>
            </div>
          )}
        </div>
      )}

      {/* Finance breakdown */}
      {finCats.length > 0 && (
        <div className="an-card">
          <div className="an-card-title">
            Spending this period · {display(financeTotal)}
          </div>
          {finCats.map(([catId, total]) => {
            const cat = FINANCE_CATEGORIES.find(c => c.id === catId)
            const pct = financeTotal > 0 ? (total / financeTotal) * 100 : 0
            return (
              <div key={catId} className="an-finance-row">
                <div className="an-finance-cat">
                  <span>{cat?.icon || '📝'}</span>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{cat?.label || catId}</span>
                </div>
                <div className="an-finance-track">
                  <div className="an-finance-fill" style={{ width: pct + '%', background: cat?.color || '#94a3b8' }} />
                </div>
                <div className="an-finance-amount">{display(total)}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!hasAnyData && (
        <div className="an-empty">
          Start logging in the other tabs —<br />
          your analytics will appear here as data builds up.
        </div>
      )}
    </div>
  )
}
