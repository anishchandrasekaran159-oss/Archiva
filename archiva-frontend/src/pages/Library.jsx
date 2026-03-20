// pages/Library.jsx
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FileCard from '../components/Filecard.jsx'
import { getFiles, deleteFile } from '../api/archiva.js'

// Subject card colour map — extend as needed
const SUBJECT_COLORS = {
  Physics:     '#185FA5',
  Mathematics: '#993556',
  Chemistry:   '#1D9E75',
  Biology:     '#854F0B',
  History:     '#6B4A2A',
  English:     '#2D5F6B',
}

function SubjectBannerIcon() {
  return (
    <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center"
         style={{ background: 'rgba(255,255,255,0.2)' }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="2" width="12" height="11" rx="1" stroke="white" strokeWidth="1.4"/>
        <path d="M5 2v11M1.5 6h3.5" stroke="white" strokeWidth="1.4"/>
      </svg>
    </div>
  )
}

function SubjectCard({ name, fileCount, lastUpdated, onClick }) {
  const color = SUBJECT_COLORS[name] || '#6B6B6B'
  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden border-[1.5px] border-warm-border cursor-pointer
                 transition-all duration-150 hover:-translate-y-0.5 group"
      style={{ '--hover-border': color }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = ''}
    >
      {/* Banner */}
      <div className="h-[88px] relative flex flex-col justify-end px-4 pb-3"
           style={{ background: color }}>
        <SubjectBannerIcon />
        <p className="text-[16px] font-medium text-white leading-tight">{name}</p>
      </div>
      {/* Footer */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-secondary">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
        {lastUpdated && <span className="text-[11px] text-ink-muted">{lastUpdated}</span>}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-4 border border-warm-border bg-warm-stat">
      <p className="text-[10px] font-medium text-ink-secondary uppercase tracking-[0.5px] mb-1">{label}</p>
      <p className="text-2xl font-medium text-ink-primary">{value}</p>
      {sub && <p className="text-[11px] font-medium text-ink-secondary mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Library() {
  const [files, setFiles]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const subject = searchParams.get('subject')

  useEffect(() => {
    setLoading(true)
    setError(null)
    getFiles(subject)
      .then(setFiles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [subject])

  async function handleDelete(id) {
    await deleteFile(id)
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // Derive subjects from files
  const subjectMap = files.reduce((acc, f) => {
    if (!f.subject) return acc
    if (!acc[f.subject]) acc[f.subject] = { count: 0, latest: null }
    acc[f.subject].count++
    const d = f.created_at ? new Date(f.created_at) : null
    if (d && (!acc[f.subject].latest || d > acc[f.subject].latest)) {
      acc[f.subject].latest = d
    }
    return acc
  }, {})

  const subjects = Object.entries(subjectMap).map(([name, { count, latest }]) => ({
    name,
    fileCount: count,
    lastUpdated: latest ? latest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null,
  }))

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full overflow-y-auto">
      <main className="p-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm">
          <StatCard label="Total files"  value={files.length}   sub="across all subjects" />
          <StatCard label="Subjects"     value={subjects.length} sub="active workspaces"   />
        </div>

        {/* Subject cards — only when not filtered */}
        {!subject && subjects.length > 0 && (
          <section className="mb-8">
            <p className="text-[13px] font-medium text-ink-primary mb-3">Your subjects</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {subjects.map(s => (
                <SubjectCard
                  key={s.name}
                  {...s}
                  onClick={() => setSearchParams({ subject: s.name })}
                />
              ))}
              {/* Add new subject */}
              <button
                className="rounded-xl border-[1.5px] border-dashed border-warm-border
                           flex flex-col items-center justify-center min-h-[130px] gap-2
                           hover:border-warm-accent transition-colors"
              >
                <Plus size={22} className="text-warm-accent" />
                <span className="text-[12px] font-medium text-ink-secondary">New subject</span>
              </button>
            </div>
          </section>
        )}

        {/* Files section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-medium text-ink-primary">
              {subject ? `${subject} — ${files.length} file${files.length !== 1 ? 's' : ''}` : 'Recent files'}
            </p>
            {subject && (
              <button
                onClick={() => setSearchParams({})}
                className="text-xs font-medium text-warm-accent hover:underline"
              >
                ← All subjects
              </button>
            )}
          </div>

          {loading && <p className="text-sm text-ink-muted font-medium mt-8 text-center">Loading…</p>}
          {error   && <p className="text-sm text-red-600 font-medium mt-8 text-center">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-3">
              {(subject ? files : recentFiles).map(file => (
                <FileCard key={file.id} file={file} onDelete={handleDelete} />
              ))}
              <button
                onClick={() => navigate('/upload')}
                className="card border-dashed flex flex-col items-center justify-center
                           min-h-[110px] gap-1.5 hover:border-warm-accent hover:bg-warm-pale"
              >
                <Plus size={22} className="text-warm-accent" />
                <span className="text-[12px] font-medium text-ink-secondary">Add resource</span>
              </button>
            </div>
          )}

          {!loading && !error && files.length === 0 && (
            <p className="text-sm font-medium text-ink-muted text-center mt-12">
              No files yet — upload your first resource.
            </p>
          )}
        </section>

      </main>
    </div>
  )
}