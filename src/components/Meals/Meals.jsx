import React, { useState, useEffect, useRef } from 'react'
import { useMeals } from '../../hooks/useMeals'
import { BREAKFASTS, LUNCHES, DINNERS, SUPPLEMENTS, EATING_ORDER_NOTE } from '../../data/meals'
import { saveImage, getImage, deleteImage, readFileAsDataUrl } from '../../utils/indexedDB'
import './Meals.css'

function MacroPills({ item }) {
  return (
    <div className="ml-plan-info-macros">
      <span className="ml-macro-pill cal">{item.cal} cal</span>
      <span className="ml-macro-pill">C {item.carbs}g</span>
      <span className="ml-macro-pill">P {item.protein}g</span>
      <span className="ml-macro-pill">F {item.fats}g</span>
      {item.iron && <span className="ml-macro-pill iron">{item.iron} iron</span>}
    </div>
  )
}

function PhotoUpload({ mealKey, photoId, onPhotoChange }) {
  const [imgSrc, setImgSrc] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (photoId) getImage(photoId).then(setImgSrc)
    else setImgSrc(null)
  }, [photoId])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readFileAsDataUrl(file)
    const id = `meal_${mealKey}_${Date.now()}`
    await saveImage(id, dataUrl)
    if (photoId) await deleteImage(photoId)
    setImgSrc(dataUrl)
    onPhotoChange(id)
  }

  async function handleRemove() {
    if (photoId) await deleteImage(photoId)
    setImgSrc(null)
    onPhotoChange(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="ml-photo-area">
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {imgSrc
        ? <>
            <img src={imgSrc} alt="meal" className="ml-photo-preview" />
            <button className="ml-photo-remove" onClick={handleRemove} title="Remove photo">✕</button>
          </>
        : <button className="ml-photo-btn" onClick={() => fileRef.current?.click()}>📷 Add photo</button>
      }
      <span className="ml-photo-note">Upload a photo to reference your portions</span>
    </div>
  )
}

function AddMealOptionModal({ mealKey, onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', cal: '', protein: '', carbs: '', fats: '', ingredients: '', tip: '' })
  const valid = form.name.trim() && form.cal
  return (
    <div className="ml-modal-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={e => e.stopPropagation()}>
        <div className="ml-modal-title">Add {mealKey === 'breakfast' ? 'Breakfast' : mealKey === 'lunch' ? 'Lunch' : 'Dinner'} Option</div>
        {[['name','Meal name *',''], ['cal','Calories *','e.g. 450'], ['protein','Protein (g)',''], ['carbs','Carbs (g)',''], ['fats','Fats (g)','']].map(([f, label, ph]) => (
          <div key={f} style={{ marginBottom: 10 }}>
            <div className="ml-label">{label}</div>
            <input className="ml-time-input" style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder={ph} value={form[f]} type={f === 'name' ? 'text' : 'number'} autoFocus={f === 'name'}
              onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
          </div>
        ))}
        <div style={{ marginBottom: 10 }}>
          <div className="ml-label">Ingredients / components</div>
          <textarea className="ml-text-input ml-input-single" placeholder="e.g. Oats, banana, honey…"
            value={form.ingredients} onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div className="ml-label">Tip (optional)</div>
          <input className="ml-time-input" style={{ width: '100%', boxSizing: 'border-box' }}
            value={form.tip} onChange={e => setForm(p => ({ ...p, tip: e.target.value }))} />
        </div>
        <div className="ml-modal-actions">
          <button className="ml-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ml-btn-save" disabled={!valid} onClick={() => {
            if (!valid) return
            onAdd({ name: form.name.trim(), cal: +form.cal, protein: +form.protein || 0, carbs: +form.carbs || 0, fats: +form.fats || 0, ingredients: form.ingredients, tip: form.tip })
            onClose()
          }}>Add</button>
        </div>
      </div>
    </div>
  )
}

function MealSection({ icon, title, time, mealKey, options, customOptions, meal, onSet, onAddOption, onDeleteOption }) {
  const [open, setOpen] = useState(false)
  const [showAddOpt, setShowAddOpt] = useState(false)
  const allOptions = [...(options || []), ...(customOptions || [])]
  const selected = allOptions.find(o => o.code === meal.code)

  return (
    <div className="ml-card">
      <div className="ml-card-header" onClick={() => setOpen(o => !o)}>
        <div className="ml-card-header-left">
          <span className="ml-card-icon">{icon}</span>
          <div>
            <div className="ml-card-title">{title}</div>
            <div className="ml-card-subtitle">
              {meal.code ? meal.code + ' · ' : ''}{meal.time || time}
              {meal.custom && !meal.code ? '✏️ custom' : ''}
            </div>
          </div>
        </div>
        <span className={`ml-card-chevron${open ? ' open' : ''}`}>▾</span>
      </div>
      {open && (
        <div className="ml-card-body">
          {/* Time */}
          <div>
            <div className="ml-label">Time eaten</div>
            <input
              type="time"
              className="ml-time-input"
              value={meal.time}
              onChange={e => onSet(mealKey, 'time', e.target.value)}
            />
          </div>

          {/* Plan picker */}
          {allOptions.length > 0 && (
            <div>
              <div className="ml-label">From meal plan</div>
              <div className="ml-plan-row">
                {allOptions.map(o => (
                  <div key={o.code} className="ml-plan-btn-wrap">
                    <button
                      className={`ml-plan-btn${meal.code === o.code ? ' selected' : ''}${customOptions?.some(c => c.code === o.code) ? ' custom' : ''}`}
                      onClick={() => onSet(mealKey, 'code', meal.code === o.code ? '' : o.code)}
                    >
                      {o.code}
                    </button>
                    {customOptions?.some(c => c.code === o.code) && (
                      <button className="ml-plan-del" onClick={e => { e.stopPropagation(); onDeleteOption(o.code) }} title="Remove">✕</button>
                    )}
                  </div>
                ))}
                <button className="ml-plan-add-btn" onClick={() => setShowAddOpt(true)} title="Add meal option">＋</button>
              </div>
            </div>
          )}
          {showAddOpt && (
            <AddMealOptionModal
              mealKey={mealKey}
              onAdd={(opt) => onAddOption(opt)}
              onClose={() => setShowAddOpt(false)}
            />
          )}

          {/* Selected plan info */}
          {selected && (
            <div className="ml-plan-info">
              <div className="ml-plan-info-name">{selected.name}</div>
              <MacroPills item={selected} />
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                {selected.ingredients || selected.components}
              </div>
              {selected.tip && <div className="ml-plan-tip">💡 {selected.tip}</div>}
              {(mealKey === 'lunch' || mealKey === 'dinner') && (
                <div className="ml-plan-order">{EATING_ORDER_NOTE}</div>
              )}
            </div>
          )}

          {/* Custom / what I actually ate */}
          <div>
            <div className="ml-label">What I actually ate</div>
            <textarea
              className="ml-text-input"
              placeholder="Describe what you cooked / ate today…"
              value={meal.custom}
              onChange={e => onSet(mealKey, 'custom', e.target.value)}
            />
          </div>

          {/* Photo */}
          <div>
            <div className="ml-label">Photo</div>
            <PhotoUpload
              mealKey={mealKey}
              photoId={meal.photoId}
              onPhotoChange={id => onSet(mealKey, 'photoId', id)}
            />
          </div>

          {/* Notes */}
          <div>
            <div className="ml-label">Notes / how I felt</div>
            <textarea
              className="ml-text-input ml-input-single"
              placeholder="Notes…"
              value={meal.note}
              onChange={e => onSet(mealKey, 'note', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SnackSection({ meal, onSet }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="ml-card">
      <div className="ml-card-header" onClick={() => setOpen(o => !o)}>
        <div className="ml-card-header-left">
          <span className="ml-card-icon">🍌</span>
          <div>
            <div className="ml-card-title">Snack / Pre-gym</div>
            <div className="ml-card-subtitle">7:15 PM (gym days only) · 1 banana + 5 almonds</div>
          </div>
        </div>
        <span className={`ml-card-chevron${open ? ' open' : ''}`}>▾</span>
      </div>
      {open && (
        <div className="ml-card-body">
          <div className="ml-plan-info" style={{ marginBottom: 0 }}>
            <div className="ml-plan-tip">⚠️ Medical necessity with Hgb 11.5 — prevents gym dizziness. Skip on non-gym days.</div>
          </div>
          <div className="ml-field-row">
            <div style={{ flex: 1 }}>
              <div className="ml-label">Time</div>
              <input type="time" className="ml-time-input" value={meal.time} onChange={e => onSet('snack', 'time', e.target.value)} />
            </div>
          </div>
          <div>
            <div className="ml-label">What I had</div>
            <textarea
              className="ml-text-input ml-input-single"
              placeholder="e.g. 1 banana + 5 almonds"
              value={meal.text || meal.custom || ''}
              onChange={e => onSet('snack', 'custom', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SupplementCard({ supp, state, onToggle, onTimeChange }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={`ml-supp-row${state.taken ? ' taken' : ''}`}
      onClick={onToggle}
    >
      <span className="ml-supp-icon">{supp.icon}</span>
      <div className="ml-supp-info">
        <div className="ml-supp-name">{supp.name}</div>
        <div className="ml-supp-timing">{supp.timing}</div>
        {supp.avoid && <div className="ml-supp-avoid">{supp.avoid}</div>}
        {expanded && <div className="ml-supp-rule">{supp.rules}</div>}
      </div>
      <input
        type="time"
        className="ml-supp-time"
        value={state.time}
        onClick={e => e.stopPropagation()}
        onChange={e => { e.stopPropagation(); onTimeChange(e.target.value) }}
      />
      <button
        className="ml-supp-expand"
        onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
      >{expanded ? '▲' : '▼'}</button>
      <div className="ml-supp-check">{state.taken ? '✓' : ''}</div>
    </div>
  )
}

function AddExtraModal({ onAdd, onClose }) {
  const [text, setText] = useState('')
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))
  return (
    <div className="ml-modal-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={e => e.stopPropagation()}>
        <div className="ml-modal-title">Log extra meal / snack</div>
        <div>
          <div className="ml-label">Time</div>
          <input type="time" className="ml-time-input" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        <div>
          <div className="ml-label">What I ate</div>
          <textarea
            className="ml-text-input"
            placeholder="e.g. Chai and biscuits · 2 idlis · Fruit…"
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
          />
        </div>
        <div className="ml-modal-actions">
          <button className="ml-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ml-btn-save" onClick={() => { if (text.trim()) { onAdd({ text: text.trim(), time }); onClose() } }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function Meals({ currentDate }) {
  const { data, setMeal, toggleSupp, setSuppTime, addExtraMeal, deleteExtraMeal, customMealOpts, addCustomMealOption, deleteCustomMealOption, suppsTaken, suppTotal, mealsLogged } = useMeals(currentDate)
  const [showAddExtra, setShowAddExtra] = useState(false)
  const [suppOpen, setSuppOpen] = useState(true)

  const totalCal = (() => {
    const allOptions = [...BREAKFASTS, ...LUNCHES, ...DINNERS]
    let cal = 0
    ;['breakfast', 'lunch', 'dinner'].forEach(m => {
      const opt = allOptions.find(o => o.code === data[m]?.code)
      if (opt) cal += opt.cal
    })
    return cal
  })()

  return (
    <div className="ml-wrap">
      {/* Summary */}
      <div className="ml-summary">
        <div className={`ml-summary-pill${mealsLogged >= 2 ? ' good' : ' warn'}`}>
          <span className="dot" />
          {mealsLogged}/3 meals logged
        </div>
        <div className={`ml-summary-pill${suppsTaken >= suppTotal - 1 ? ' good' : ' warn'}`}>
          <span className="dot" />
          {suppsTaken}/{suppTotal} supplements
        </div>
        {totalCal > 0 && (
          <div className="ml-summary-pill">
            <span className="dot" style={{ background: 'var(--color-orange)' }} />
            ~{totalCal} cal planned
          </div>
        )}
      </div>

      {/* Meals */}
      <MealSection icon="🌅" title="Breakfast" time="10:00–10:30 AM" mealKey="breakfast" options={BREAKFASTS} customOptions={customMealOpts.breakfasts} meal={data.breakfast} onSet={setMeal}
        onAddOption={opt => addCustomMealOption('breakfasts', opt)} onDeleteOption={code => deleteCustomMealOption('breakfasts', code)} />
      <MealSection icon="☀️" title="Lunch"     time="1:30–2:30 PM"  mealKey="lunch"     options={LUNCHES}     customOptions={customMealOpts.lunches}     meal={data.lunch}     onSet={setMeal}
        onAddOption={opt => addCustomMealOption('lunches', opt)} onDeleteOption={code => deleteCustomMealOption('lunches', code)} />
      <SnackSection meal={data.snack} onSet={setMeal} />
      <MealSection icon="🌙" title="Dinner"    time="9:00–9:30 PM"  mealKey="dinner"    options={DINNERS}     customOptions={customMealOpts.dinners}     meal={data.dinner}    onSet={setMeal}
        onAddOption={opt => addCustomMealOption('dinners', opt)} onDeleteOption={code => deleteCustomMealOption('dinners', code)} />

      {/* Extra meals */}
      <div className="ml-card">
        <div className="ml-card-header" onClick={() => {}}>
          <div className="ml-card-header-left">
            <span className="ml-card-icon">➕</span>
            <div>
              <div className="ml-card-title">Extra meals / snacks</div>
              <div className="ml-card-subtitle">Log anything else you ate today</div>
            </div>
          </div>
        </div>
        <div className="ml-card-body">
          {(data.extraMeals || []).map(e => (
            <div key={e.id} className="ml-extra-row">
              <span className="time">{e.time}</span>
              <span>{e.text}</span>
              <button className="del" onClick={() => deleteExtraMeal(e.id)}>✕</button>
            </div>
          ))}
          <button className="ml-add-btn" onClick={() => setShowAddExtra(true)}>+ Add meal / snack</button>
        </div>
      </div>

      {/* Supplements */}
      <div className="ml-card">
        <div className="ml-card-header" onClick={() => setSuppOpen(o => !o)}>
          <div className="ml-card-header-left">
            <span className="ml-card-icon">💊</span>
            <div>
              <div className="ml-card-title">Supplements</div>
              <div className="ml-card-subtitle">{suppsTaken}/{suppTotal} taken today</div>
            </div>
          </div>
          <span className={`ml-card-chevron${suppOpen ? ' open' : ''}`}>▾</span>
        </div>
        {suppOpen && (
          <div className="ml-card-body">
            <div className="ml-supps-grid">
              {SUPPLEMENTS.map(s => (
                <SupplementCard
                  key={s.id}
                  supp={s}
                  state={data.supplements[s.id] || { taken: false, time: '' }}
                  onToggle={() => toggleSupp(s.id)}
                  onTimeChange={t => setSuppTime(s.id, t)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddExtra && <AddExtraModal onAdd={addExtraMeal} onClose={() => setShowAddExtra(false)} />}
    </div>
  )
}
