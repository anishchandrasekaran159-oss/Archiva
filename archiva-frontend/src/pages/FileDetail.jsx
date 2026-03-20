// pages/FileDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react'
import { getFile, deleteFile } from '../api/archiva.js'

const EXT_COLORS = {
  pdf:  { bg: '#FDDCDC', stroke: '#C0392B' },
  docx: { bg: '#D6E8FF', stroke: '#1A5FA8' },
  doc:  { bg: '#D6E8FF', stroke: '#1A5FA8' },
  pptx: { bg: '#FFE9C8', stroke: '#B85C1A' },
  ppt:  { bg: '#FFE9C8', stroke: '#B85C1A' },
  png:  { bg: '#D8F0D8', stroke: '#1A7A3A' },
  jpg:  { bg: '#D8F0D8', stroke: '#1A7A3A' },
  jpeg: { bg: '#D8F0D8', stroke: '#1A7A3A' },
}

function getExt(filename = '') {
  return filename.split('.').pop().toLowerCase()
}

function FileTypeIcon({ filename, size = 44 }) {
  const ext = getExt(filename)
  const { bg, stroke } = EXT_COLORS[ext] || { bg: '#E8E0D4', stroke: '#8A6040' }
  return (
    <div className="rounded-xl flex items-center justify-center flex-shrink-0"
         style={{ width: size, height: size, background: bg }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="2" fill={stroke} opacity="0.2"/>
        <path d="M7 8h6M7 11h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function RecCard({ file, onClick }) {
  const date = file.created_at ? new Date(file.created_at).toLocaleDateString() : null
  return (
    <div onClick={onClick} className="card cursor-pointer flex gap-3 items-start hover:border-warm-accent transition-colors">
      <FileTypeIcon filename={file.filename} size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink-primary leading-snug mb-0.5 line-clamp-1">{file.filename}</p>
        {file.note && (
          <p className="text-[11px] text-ink-secondary line-clamp-2 leading-snug mb-1">{file.note}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {file.subject && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warm-tag text-warm-tag-text">{file.subject}</span>
          )}
          {date && <span className="text-[10px] font-medium text-ink-muted">{date}</span>}
        </div>
      </div>
    </div>
  )
}

export default function FileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getFile(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    const name = data?.file?.filename
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await deleteFile(id)
    navigate('/')
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-full">
      <p className="text-sm font-medium text-ink-muted">Loading…</p>
    </div>
  )

  if (error) return (
    <div className="flex-1 flex items-center justify-center h-full">
      <p className="text-sm font-medium text-red-600">{error}</p>
    </div>
  )

  const file  = data?.file
  const recs  = data?.recommendations ?? []
  const date  = file?.created_at
    ? new Date(file.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const sizeMB = file?.file_size_bytes
    ? `${(file.file_size_bytes / (1024 * 1024)).toFixed(2)} MB`
    : null

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-8 max-w-3xl">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary
                     hover:text-ink-primary transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="bg-white border-[1.5px] border-warm-border rounded-xl p-6 mb-5">
          <div className="flex items-start gap-4 mb-5">
            <FileTypeIcon filename={file.filename} size={52} />
            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-medium text-ink-primary leading-tight mb-1 font-serif">
                {file.filename}
              </h1>
              {file.note && (
                <p className="text-[13px] text-ink-secondary leading-relaxed">{file.note}</p>
              )}
            </div>
            {file.download_url && (
              <a href={file.download_url} target="_blank" rel="noreferrer" className="btn-primary flex-shrink-0">
                <ExternalLink size={14} />
                Open file
              </a>
            )}
          </div>

          <div className="border-t-[1.5px] border-warm-border mb-4" />

          <div className="grid grid-cols-3 gap-4">
            {file.subject && (
              <div>
                <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">Subject</p>
                <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-warm-tag text-warm-tag-text inline-block">
                  {file.subject}
                </span>
              </div>
            )}
            {date && (
              <div>
                <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">Uploaded</p>
                <p className="text-[13px] font-medium text-ink-primary">{date}</p>
              </div>
            )}
            {sizeMB && (
              <div>
                <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">File size</p>
                <p className="text-[13px] font-medium text-ink-primary">{sizeMB}</p>
              </div>
            )}
          </div>

          <div className="border-t-[1.5px] border-warm-border mt-5 pt-4 flex justify-end">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-[12px] font-medium text-ink-muted hover:text-red-600 transition-colors"
            >
              <Trash2 size={13} />
              Delete file
            </button>
          </div>
        </div>

        {recs.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[13px] font-medium text-ink-primary">You might also need</h2>
              <span className="text-[11px] font-medium text-ink-muted">— based on similarity</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {recs.map(rec => (
                <RecCard key={rec.id} file={rec} onClick={() => navigate(`/files/${rec.id}`)} />
              ))}
            </div>
          </>
        )}

        {recs.length === 0 && (
          <p className="text-[12px] font-medium text-ink-muted text-center mt-4">
            No similar files found yet — upload more resources to see recommendations.
          </p>
        )}
      </div>
    </div>
  )
}