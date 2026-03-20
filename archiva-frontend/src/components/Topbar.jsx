// components/Topbar.jsx
import { Search, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Topbar({ title }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="flex items-center gap-3 px-6 py-3.5 bg-white
                       border-b-[1.5px] border-[#E0C9A8] sticky top-0 z-10">
      <h1 className="text-[16px] font-medium text-ink-primary whitespace-nowrap font-serif">
        {title}
      </h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
        />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Get What you want mam..."
          className="field pl-8"
        />
      </form>

      {/* Upload CTA */}
      <button onClick={() => navigate('/upload')} className="btn-primary whitespace-nowrap">
        <Upload size={14} />
        Upload
      </button>
    </header>
  )
}