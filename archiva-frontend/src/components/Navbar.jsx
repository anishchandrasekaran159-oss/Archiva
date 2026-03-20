// components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const navClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ` +
    (isActive
      ? 'bg-warm-accent text-white'
      : 'text-ink-secondary hover:bg-warm-hover hover:text-ink-primary')

  return (
    <nav className="h-14 bg-white border-b-[1.5px] border-[#E0C9A8] flex items-center px-6 flex-shrink-0 sticky top-0 z-20">

      {/* Left — Logo + Nav links (fixed width so center is truly centered) */}
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

      {/* Center — Search bar, truly centered */}
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

      {/* Right — Avatar (fixed width to balance left side) */}
      <div className="w-[280px] flex-shrink-0 flex justify-end">
        <div
          className="w-[30px] h-[30px] rounded-full bg-warm-accent flex items-center justify-center
                     text-white text-[11px] font-medium flex-shrink-0 cursor-pointer"
          title="Mrs. Rose"
        >
          SR
        </div>
      </div>

    </nav>
  )
}