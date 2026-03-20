// pages/Search.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import Topbar from '../components/Topbar.jsx'
import { searchFiles } from '../api/archiva.js'

// Map extension to icon colors (matches FileCard)
const EXT_COLORS = {
  pdf:  { bg: '#FDDCDC', stroke: '#C0392B' },
  docx: { bg: '#D6E8FF', stroke: '#1A5FA8' },
  doc:  { bg: '#D6E8FF', stroke: '#1A5FA8' },
  pptx: { bg: '#FFE9C8', stroke: '#B85C1A' },
  png:  { bg: '#D8F0D8', stroke: '#1A7A3A' },
  jpg:  { bg: '#D8F0D8', stroke: '#1A7A3A' },
}

function getExt(filename = '') {
  return filename.split('.').pop().toLowerCase()
}

function ResultCard({ result }) {
  // Actual backend shape:
  // { id, filename, note, subject, similarity, storage_path, created_at, download_url }
  const ext = getExt(result.filename)
  const { bg, stroke } = EXT_COLORS[ext] || { bg: '#E8E0D4', stroke: '#8A6040' }
  const pct = result.similarity != null ? `${Math.round(result.similarity * 100)}%` : null
  const date = result.created_at
    ? new Date(result.created_at).toLocaleDateString()
    : null

  return (
    <div className="card flex gap-3 items-start mb-2.5">
      {/* File type icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
           style={{ background: bg }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="4" y="2" width="12" height="16" rx="2" fill={stroke} opacity="0.2"/>
          <path d="M7 8h6M7 11h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {/* Filename + match badge */}
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[13px] font-medium text-ink-primary leading-snug">
            {result.filename}
          </span>
          {pct && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full
                             bg-warm-accent text-white whitespace-nowrap">
              {pct} match
            </span>
          )}
        </div>

        {/* Note + subject + date */}
        <p className="text-[11px] font-medium text-ink-secondary mb-1">
          {[date, result.subject].filter(Boolean).join(' · ')}
        </p>

        {/* Note — the human-readable description */}
        {result.note && (
          <p className="text-[12px] font-medium text-ink-secondary leading-relaxed mb-1">
            {result.note}
          </p>
        )}

        {/* Download link */}
        {result.download_url && (
          <a
            href={result.download_url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-warm-accent hover:underline"
          >
            Open file
          </a>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [params]          = useSearchParams()
  const initialQ          = params.get('q') || ''
  const [query, setQuery] = useState(initialQ)
  const [input, setInput] = useState(initialQ)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialQ) runSearch(initialQ)
  }, [])

  async function runSearch(q) {
    if (!q.trim()) return
    setQuery(q)
    setLoading(true)
    setSearched(true)
    setError(null)
    try {
      const data = await searchFiles(q)
      // Backend returns { query, results: [...] }
      setResults(Array.isArray(data) ? data : data.results ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    runSearch(input)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Topbar title="Search" />

      <main className="flex-1 overflow-y-auto p-6 max-w-2xl">

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <SearchIcon size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"/>
            <input
              className="field pl-8"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Try "notes on light refraction" or "integration problems"…'
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>

        {/* Hint bar */}
        {!searched && (
          <div className="flex items-center gap-2 bg-warm-pale border-[1.5px] border-warm-border
                          rounded-lg px-3.5 py-2.5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-warm-accent flex-shrink-0"/>
            <p className="text-[12px] font-medium text-ink-secondary">
              Use natural language — Archiva understands meaning, not just keywords.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-sm font-medium text-ink-muted text-center mt-8">Searching…</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm font-medium text-red-600 mt-4">{error}</p>
        )}

        {/* Results */}
        {!loading && searched && !error && (
          <>
            <p className="text-[13px] font-medium text-ink-secondary mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <strong className="text-ink-primary">"{query}"</strong>
            </p>
            {results.length === 0 ? (
              <p className="text-sm font-medium text-ink-muted text-center mt-8">
                No matching resources found. Try different phrasing.
              </p>
            ) : (
              results.map(r => <ResultCard key={r.id} result={r} />)
            )}
          </>
        )}
      </main>
    </div>
  )
}