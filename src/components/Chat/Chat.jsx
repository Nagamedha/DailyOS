import React, { useState, useRef, useEffect } from 'react'
import { exportForClaude } from '../../utils/storage'
import './Chat.css'

const API_KEY_KEY = 'chat_api_key'
const HISTORY_KEY = 'chat_history'
const MAX_HISTORY = 40

const QUICK_PROMPTS = [
  'How am I doing this week?',
  'What should I focus on tomorrow?',
  'How is my sleep this week?',
  'Am I hitting my study targets?',
  'Give me a motivational summary',
  'What are my streaks looking like?',
]

function ls(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

export default function Chat() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_KEY) || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [messages, setMessages] = useState(() => ls(HISTORY_KEY) || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function saveKey(key) {
    localStorage.setItem(API_KEY_KEY, key)
    setApiKey(key)
    setShowKeyInput(false)
  }

  function clearHistory() {
    if (window.confirm('Clear all chat history?')) {
      setMessages([])
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    if (!apiKey) { setShowKeyInput(true); return }

    const userMsg = { role: 'user', content: text.trim(), ts: Date.now() }
    const next = [...messages, userMsg].slice(-MAX_HISTORY)
    setMessages(next)
    ss(HISTORY_KEY, next)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const context = exportForClaude(14)
      const systemPrompt = `You are a personal health and productivity coach assistant built into DailyOS — a daily tracking app. You have access to the user's logged data below. Answer questions helpfully, concisely, and personally based on their actual data. Be encouraging but honest.

LOGGED DATA (last 14 days):
${context}

Keep answers under 200 words unless detail is specifically needed. Use bullet points for lists.`

      const apiMessages = next.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const isOpenAI = apiKey.startsWith('sk-') && !apiKey.startsWith('sk-ant-')

      let reply
      if (isOpenAI) {
        // OpenAI API
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 600,
            messages: [{ role: 'system', content: systemPrompt }, ...apiMessages],
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `API error ${res.status}`)
        }
        const data = await res.json()
        reply = data.choices?.[0]?.message?.content || '(no response)'
      } else {
        // Anthropic API
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
            system: systemPrompt,
            messages: apiMessages,
          }),
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `API error ${res.status}`)
        }
        const data = await res.json()
        reply = data.content?.[0]?.text || '(no response)'
      }
      const assistantMsg = { role: 'assistant', content: reply, ts: Date.now() }
      const withReply = [...next, assistantMsg].slice(-MAX_HISTORY)
      setMessages(withReply)
      ss(HISTORY_KEY, withReply)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-wrap">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-title">AI Coach</div>
          <div className="chat-subtitle">Ask about your logged data</div>
        </div>
        <div className="chat-header-actions">
          {messages.length > 0 && (
            <button className="chat-icon-btn" onClick={clearHistory} title="Clear history">🗑</button>
          )}
          <button className="chat-icon-btn" onClick={() => setShowKeyInput(s => !s)} title="API key settings">⚙️</button>
        </div>
      </div>

      {/* API key setup */}
      {showKeyInput && (
        <ApiKeyCard apiKey={apiKey} onSave={saveKey} onClose={() => setShowKeyInput(false)} />
      )}

      {/* No key warning */}
      {!apiKey && !showKeyInput && (
        <div className="chat-setup-card">
          <div className="chat-setup-icon">🔑</div>
          <div className="chat-setup-text">Add an OpenAI or Anthropic API key to start chatting with your logged data</div>
          <button className="chat-setup-btn" onClick={() => setShowKeyInput(true)}>Add API Key</button>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && apiKey && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">Ask me anything about your logs!</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg--assistant">
            <div className="chat-bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        {error && (
          <div className="chat-error">⚠️ {error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {apiKey && messages.length === 0 && (
        <div className="chat-quick-prompts">
          {QUICK_PROMPTS.map(p => (
            <button key={p} className="chat-quick-btn" onClick={() => sendMessage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      {apiKey && (
        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about your progress…"
            value={input}
            rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
            }}
          />
          <button
            className={`chat-send-btn${loading || !input.trim() ? ' disabled' : ''}`}
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >▶</button>
        </div>
      )}
    </div>
  )
}

function ApiKeyCard({ apiKey, onSave, onClose }) {
  const [val, setVal] = useState(apiKey)
  return (
    <div className="chat-key-card">
      <div className="chat-key-title">Anthropic API Key</div>
      <div className="chat-key-hint">
        Paste an <strong>OpenAI key</strong> (platform.openai.com) starting with <code>sk-</code>, or an <strong>Anthropic key</strong> (console.anthropic.com) starting with <code>sk-ant-</code>. Stored locally on your device only.
      </div>
      <input
        className="chat-key-input"
        type="password"
        placeholder="sk-... (OpenAI) or sk-ant-... (Anthropic)"
        value={val}
        autoFocus
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSave(val.trim())}
      />
      <div className="chat-key-actions">
        <button className="chat-key-cancel" onClick={onClose}>Cancel</button>
        <button className="chat-key-save" onClick={() => onSave(val.trim())}>Save</button>
      </div>
    </div>
  )
}
