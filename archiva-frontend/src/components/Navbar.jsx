// components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

export default function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery]       = useState('')
  const [user, setUser]         = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  // Get initials from full_name, skipping honorifics like Mrs./Mr./Dr.
  // "Mrs. Sridevi Rose" → "SR", "Anish Kumar" → "AK"
  // Falls back to email if no name is set
  function getInitials(user) {
    const name = user?.user_metadata?.full_name
    if (name) {
      const words = name.trim().split(/\s+/).filter(w => !/^(mr|mrs|ms|dr|prof)\.?$/i.test(w))
      if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
      if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    }
    const email = user?.email ?? ''
    const parts = email.split('@')[0].split(/[._\-]/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return email.slice(0, 2).toUpperCase()
  }

  const initials    = user ? getInitials(user) : '?'
  const displayName = user?.user_metadata?.full_name || user?.email || ''
  const email       = user?.email ?? ''

  const navClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ` +
    (isActive
      ? 'bg-warm-accent text-white'
      : 'text-ink-secondary hover:bg-warm-hover hover:text-ink-primary')

  return (
    <nav className="h-14 bg-white border-b-[1.5px] border-[#E0C9A8] flex items-center px-6 flex-shrink-0 sticky top-0 z-20">

      {/* Left — Logo + Nav */}
      <div className="flex items-center gap-4 w-[280px] flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-[30px] h-[30px] bg-warm-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="5.5" height="7.5" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="1.5" width="5.5" height="4" rx="1" fill="white" opacity="0.75"/>
              <rect x="1.5" y="11" width="13" height="3.5" rx="1" fill="white" opacity="0.65"/>
              <rect x="9" y="7.5" width="5.5" height="3" rx="1" fill="white" opacity="0.85"/>
            </svg>
          </div>
          <span className="text-[17px] font-medium text-ink-primary tracking-tight font-serif">Archiva</span>
        </div>

        <div className="flex items-center gap-0.5">
          <NavLink to="/" end className={navClass}>Library</NavLink>
          <NavLink to="/upload" className={navClass}>Upload</NavLink>
          <NavLink to="/search" className={navClass}>Search</NavLink>
        </div>
      </div>

      {/* Center — Search */}
      <div className="flex-1 flex justify-center px-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full h-9 pl-9 pr-3 border-[1.5px] border-[#C4956A] rounded-lg text-[13px]
                       font-medium text-ink-primary bg-[#FFFAF5] placeholder:text-ink-muted placeholder:font-normal
                       focus:outline-none focus:border-warm-accent transition-colors"
          />
        </form>
      </div>

      {/* Right — Avatar + dropdown */}
      <div className="w-[280px] flex-shrink-0 flex justify-end" ref={menuRef}>
        <div className="relative">

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-[32px] h-[32px] rounded-full bg-warm-accent flex items-center justify-center
                       text-white text-[11px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            title={displayName}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border-[1.5px]
                            border-warm-border rounded-xl shadow-lg overflow-hidden z-50">

              {/* Show name + email, or just email if no name */}
              <div className="px-4 py-3 border-b-[1.5px] border-warm-border">
                {displayName !== email && (
                  <p className="text-[13px] font-medium text-ink-primary truncate mb-0.5">{displayName}</p>
                )}
                <p className="text-[11px] text-ink-muted truncate">{email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium
                           text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Log out
              </button>

            </div>
          )}
        </div>
      </div>

    </nav>
  )
}