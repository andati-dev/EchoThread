import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'
import PostDetail from './pages/PostDetail'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login onLogin={(t) => { localStorage.setItem('token', t); window.location.href = '/' }} />} />
          <Route path="/register" element={<Register onRegister={(t) => { localStorage.setItem('token', t); window.location.href = '/' }} />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
)
