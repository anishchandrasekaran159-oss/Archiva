// src/pages/Signup.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    // Store full_name in user_metadata — readable anywhere via supabase.auth.getSession()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
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
            Create your library
          </h1>
          <p className="text-[13px] text-ink-secondary mb-6">
            Set up your Archiva account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="block text-[13px] font-medium text-ink-primary mb-1.5">
                Full name
              </label>
              <input
                type="text"
                className="field"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Mrs. Sridevi Rose"
                required
                autoFocus
              />
            </div>

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
                placeholder="Min. 8 characters"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-primary mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                className="field"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] font-medium text-ink-secondary mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-warm-accent hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}