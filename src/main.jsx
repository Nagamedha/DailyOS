// ─────────────────────────────────────────────────────────────────────────────
// main.jsx — Application entry point
//
// This file is the first thing React runs. It finds the <div id="root"> in
// index.html and mounts the entire App component tree inside it.
//
// React.StrictMode helps catch potential bugs during development.
// It does NOT affect production behaviour.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css' // global styles loaded once here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
