// pages/Library.jsx
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Topbar from '../components/Topbar.jsx'
import FileCard from '../components/Filecard.jsx'
import { getFiles, deleteFile } from '../api/archiva.js'

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-4 border border-warm-border bg-warm-stat">
      <p className="text-[11px] font-medium text-ink-secondary uppercase tracking-[0.5px] mb-1">
        {label}
      </p>
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
  const [searchParams] = useSearchParams()
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


  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Topbar title="Library" />

      <main className="flex-1 overflow-y-auto p-6">

        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Total Files" value={files.length} sub="across all subjects" />
          <StatCard
            label="Subjects"
            value={new Set(files.map(f => f.subject).filter(Boolean)).size || 0}
            sub="active workspaces"
          />
    
        </div>

        {/* Files grid */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-ink-primary">
            {subject ? `${subject} files` : 'Recent files'}
          </h2>
          {subject && (
            <button onClick={() => navigate('/')} className="text-xs font-medium text-warm-accent hover:underline">Clear filter</button>
          )}
        </div>

        {loading && (
          <p className="text-sm text-ink-muted font-medium mt-8 text-center">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-red-600 font-medium mt-8 text-center">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-3">
            {files.map(file => (
              <FileCard key={file.id} file={file} onDelete={handleDelete} />
            ))}

            {/* Add new tile */}
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
      </main>
    </div>
  )
}