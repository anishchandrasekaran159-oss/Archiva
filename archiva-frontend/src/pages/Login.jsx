// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')   // ProtectedRoute will let them through now
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6EE] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-warm-accent rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="5.5" height="7.5" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="1.5" width="5.5" height="4" rx="1" fill="white" opacity="0.75"/>
              <rect x="1.5" y="11" width="13" height="3.5" rx="1" fill="white" opacity="0.65"/>
              <rect x="9" y="7.5" width="5.5" height="3" rx="1" fill="white" opacity="0.85"/>
            </svg>
          </div>
          <span className="text-[22px] font-medium text-ink-primary tracking-tight font-serif">
            Archiva
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border-[1.5px] border-warm-border rounded-2xl p-8">
          <h1 className="text-[18px] font-medium text-ink-primary font-serif mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-ink-secondary mb-6">
            Sign in to your resource library
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-primary mb-1.5">
                Email
              </label>
              <input
                type="email"
                className="field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-primary mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-[12px] font-medium text-red-600 bg-red-50
                            border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center py-2.5 mt-1
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] font-medium text-ink-secondary mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-warm-accent hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}