import React, { useState, useEffect } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { FINANCE_CATEGORIES } from '../../data/meals'
import { getUsdToInr, fmtINR, fmtUSD } from '../../utils/currency'
import './Finance.css'

function fmt(amount, currency, baseCurrency, rate) {
  const inBase = currency === baseCurrency ? amount : baseCurrency === 'INR' ? amount * rate : amount / rate
  return baseCurrency === 'INR' ? fmtINR(inBase) : fmtUSD(inBase)
}

export default function Finance({ currentDate }) {
  const { txns, settings, totalToday, addTxn, deleteTxn, updateRate, toggleBaseCurrency, toBase, getMonthTxns } = useFinance(currentDate)

  const [amount, setAmount]   = useState('')
  const [currency, setCur]    = useState('INR')
  const [category, setCat]    = useState('')
  const [customCat, setCustom] = useState('')
  const [note, setNote]       = useState('')
  const [liveRate, setLiveRate] = useState(settings.exchangeRate)

  useEffect(() => {
    getUsdToInr().then(r => { setLiveRate(r); updateRate(r) })
  }, [])

  const { baseCurrency, exchangeRate } = settings

  function handleAdd() {
    const val = parseFloat(amount)
    if (!val || !category) return
    const catLabel = category === 'custom' ? (customCat || 'Other') : (FINANCE_CATEGORIES.find(c => c.id === category)?.label || category)
    addTxn({ amount: val, currency, category, categoryLabel: catLabel, note })
    setAmount(''); setNote('')
  }

  // Month breakdown
  const monthStr = currentDate.toISOString().slice(0, 7)
  const monthTxns = getMonthTxns(monthStr)
  const byCat = {}
  monthTxns.forEach(t => {
    const b = toBase(t.amount, t.currency)
    byCat[t.category] = (byCat[t.category] || 0) + b
  })
  const monthTotal = Object.values(byCat).reduce((a, b) => a + b, 0)
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1])

  const display = (amount) => baseCurrency === 'INR' ? fmtINR(amount) : fmtUSD(amount)

  return (
    <div className="fn-wrap">
      {/* Summary */}
      <div className="fn-summary-card">
        <div className="fn-summary-total">{display(totalToday)}</div>
        <div className="fn-summary-label">spent today</div>
        <div className="fn-summary-row">
          <button className="fn-currency-toggle" onClick={toggleBaseCurrency}>
            {baseCurrency === 'INR' ? '₹ INR' : '$ USD'} ⇄
          </button>
          <span className="fn-rate-badge">
            1 USD = <input
              className="fn-rate-input"
              type="number"
              value={exchangeRate}
              onChange={e => updateRate(Number(e.target.value))}
            /> INR
          </span>
        </div>
      </div>

      {/* Add expense */}
      <div className="fn-add-card">
        <div className="fn-add-title">Log expense</div>

        <div className="fn-amount-row">
          <select className="fn-currency-select" value={currency} onChange={e => setCur(e.target.value)}>
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
          </select>
          <input
            type="number"
            className="fn-amount-input"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </div>

        <div className="fn-cat-grid">
          {FINANCE_CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`fn-cat-btn${category === c.id ? ' selected' : ''}`}
              onClick={() => setCat(c.id)}
            >
              <span className="fn-cat-icon">{c.icon}</span>
              <span className="fn-cat-label">{c.label}</span>
            </button>
          ))}
          <button
            className={`fn-cat-btn${category === 'custom' ? ' selected' : ''}`}
            onClick={() => setCat('custom')}
          >
            <span className="fn-cat-icon">✏️</span>
            <span className="fn-cat-label">Custom</span>
          </button>
        </div>

        {category === 'custom' && (
          <input
            className="fn-custom-input"
            placeholder="Category name…"
            value={customCat}
            onChange={e => setCustom(e.target.value)}
          />
        )}

        <input
          className="fn-note-input"
          placeholder="Note (e.g. Woolworths, Netflix, rent payment…)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <button
          className="fn-add-submit"
          onClick={handleAdd}
          disabled={!amount || !category}
        >
          Add expense
        </button>
      </div>

      {/* Today's transactions */}
      <div className="fn-txns-card">
        <div className="fn-txns-header">Today's transactions</div>
        {txns.length === 0
          ? <div className="fn-txn-empty">No expenses logged today</div>
          : txns.slice().reverse().map(t => {
              const cat = FINANCE_CATEGORIES.find(c => c.id === t.category)
              return (
                <div key={t.id} className="fn-txn-row">
                  <div className="fn-txn-icon" style={{ background: (cat?.color || '#94a3b8') + '22' }}>
                    {cat?.icon || '📝'}
                  </div>
                  <div className="fn-txn-info">
                    <div className="fn-txn-cat">{t.categoryLabel || cat?.label || t.category}</div>
                    {t.note && <div className="fn-txn-note">{t.note}</div>}
                    <div className="fn-txn-time">{t.time}</div>
                  </div>
                  <div className="fn-txn-amount">
                    {t.currency === 'INR' ? fmtINR(t.amount) : fmtUSD(t.amount)}
                  </div>
                  <button className="fn-txn-del" onClick={() => deleteTxn(t.id)}>✕</button>
                </div>
              )
            })
        }
      </div>

      {/* Month chart */}
      {sortedCats.length > 0 && (
        <div className="fn-chart-card">
          <div className="fn-chart-title">This month · {display(monthTotal)}</div>
          {sortedCats.map(([catId, total]) => {
            const cat = FINANCE_CATEGORIES.find(c => c.id === catId)
            const pct = monthTotal > 0 ? (total / monthTotal) * 100 : 0
            return (
              <div key={catId} className="fn-chart-bar-row">
                <div className="fn-chart-bar-label">
                  <span>{cat?.icon || '📝'}</span>
                  <span>{cat?.label || catId}</span>
                </div>
                <div className="fn-chart-bar-track">
                  <div
                    className="fn-chart-bar-fill"
                    style={{ width: pct + '%', background: cat?.color || '#94a3b8' }}
                  />
                </div>
                <div className="fn-chart-bar-amount">{display(total)}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
