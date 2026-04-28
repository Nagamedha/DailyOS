import React, { useState, useEffect, useRef } from 'react'
import { useJournal } from '../../hooks/useJournal'
import { MOODS, AFFIRMATIONS } from '../../data/meals'
import { saveImage, getImage, deleteImage, readFileAsDataUrl } from '../../utils/indexedDB'
import './Journal.css'

const PROMPTS = [
  "What made me smile today?",
  "What was challenging?",
  "What am I grateful for?",
  "How did my body feel today?",
  "What would I do differently?",
  "What am I proud of today?",
  "What's on my mind right now?",
  "One thing I want to remember",
]

function EntryImage({ imageId }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    if (imageId) getImage(imageId).then(setSrc)
  }, [imageId])
  if (!src) return null
  return <img src={src} alt="memory" className="jn-entry-img" />
}

export default function Journal({ currentDate }) {
  const { data, setMood, setAffirmationIdx, addEntry, deleteEntry, getRecentMoods } = useJournal(currentDate)

  const [text, setText]         = useState('')
  const [pendingImg, setPendingImg] = useState(null) // { id, src }
  const fileRef = useRef(null)

  const affIdx = data.affirmationIdx ?? (currentDate.getDate() % AFFIRMATIONS.length)
  const affirmation = AFFIRMATIONS[affIdx]

  function shuffle() {
    const next = (affIdx + 1) % AFFIRMATIONS.length
    setAffirmationIdx(next)
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await readFileAsDataUrl(file)
    const id = `journal_${Date.now()}`
    await saveImage(id, dataUrl)
    setPendingImg({ id, src: dataUrl })
  }

  async function handleSave() {
    if (!text.trim()) return
    addEntry(text.trim(), pendingImg?.id || null)
    setText('')
    setPendingImg(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function appendPrompt(prompt) {
    setText(prev => prev ? prev + '\n\n' + prompt + '\n' : prompt + '\n')
  }

  async function handleDeleteEntry(entry) {
    if (entry.imageId) await deleteImage(entry.imageId)
    deleteEntry(entry.id)
  }

  return (
    <div className="jn-wrap">
      {/* Affirmation */}
      <div className="jn-affirmation">
        <div className="jn-aff-label">Today's affirmation</div>
        <div className="jn-aff-text">"{affirmation}"</div>
        <button className="jn-aff-shuffle" onClick={shuffle} title="New affirmation">↻</button>
      </div>

      {/* Mood */}
      <div className="jn-mood-card">
        <div className="jn-mood-title">How are you feeling today?</div>
        <div className="jn-mood-row">
          {MOODS.map(m => (
            <button
              key={m.value}
              className={`jn-mood-btn${data.mood === m.value ? ' selected' : ''}`}
              onClick={() => setMood(data.mood === m.value ? null : m.value)}
            >
              <span className="jn-mood-emoji">{m.emoji}</span>
              <span className="jn-mood-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Write */}
      <div className="jn-write-card">
        <div className="jn-write-title">Write freely…</div>

        {/* Prompt chips */}
        <div className="jn-prompts">
          <div className="jn-prompt-title">Prompts</div>
          <div className="jn-prompt-chips">
            {PROMPTS.map(p => (
              <button key={p} className="jn-prompt-chip" onClick={() => appendPrompt(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="jn-textarea"
          placeholder="This is your space — thoughts, feelings, memories, reflections…"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <div className="jn-write-actions">
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {pendingImg
            ? <>
                <img src={pendingImg.src} alt="pending" className="jn-photo-preview-sm" />
                <button className="jn-photo-remove" onClick={async () => { await deleteImage(pendingImg.id); setPendingImg(null) }}>✕</button>
              </>
            : <button className="jn-photo-btn" onClick={() => fileRef.current?.click()}>📷 Photo</button>
          }
          <button className="jn-save-btn" onClick={handleSave} disabled={!text.trim()}>
            Save entry
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="jn-entries-card">
        <div className="jn-entries-header">
          Today's entries {data.entries.length > 0 ? `(${data.entries.length})` : ''}
        </div>
        {data.entries.length === 0
          ? <div className="jn-entry-empty">No entries yet — write your first thought above</div>
          : data.entries.slice().reverse().map(entry => (
              <div key={entry.id} className="jn-entry">
                <div className="jn-entry-meta">
                  <span className="jn-entry-time">{entry.time}</span>
                  {data.mood && entry.ts === data.entries[0]?.ts && (
                    <span>{MOODS.find(m => m.value === data.mood)?.emoji}</span>
                  )}
                  <button className="jn-entry-del" onClick={() => handleDeleteEntry(entry)}>✕</button>
                </div>
                <div className="jn-entry-text">{entry.text}</div>
                {entry.imageId && <EntryImage imageId={entry.imageId} />}
              </div>
            ))
        }
      </div>
    </div>
  )
}
