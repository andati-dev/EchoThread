import React, { useState } from 'react'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

export default function Login({ onLogin }: { onLogin?: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      addToast({ type: 'success', message: 'Logged in' })
      onLogin?.(res.data.token)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
      addToast({ type: 'error', message: err?.response?.data?.error || 'Login failed' })
    } finally { setLoading(false) }
  }

  return (
    <form className="max-w-md mx-auto p-4 bg-white rounded" onSubmit={submit}>
      <h2 className="text-lg font-semibold mb-3">Login</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">
        <input className="w-full border px-2 py-1" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-2">
        <input className="w-full border px-2 py-1" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </div>
    </form>
  )
}
