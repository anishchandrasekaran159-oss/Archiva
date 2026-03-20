// components/FileCard.jsx
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Map file extension → accent color
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

function FileIcon({ filename }) {
  const ext = getExt(filename)
  const { bg, stroke } = EXT_COLORS[ext] || { bg: '#E8E0D4', stroke: '#8A6040' }
  return (
    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 flex-shrink-0"
         style={{ background: bg }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="2" fill={stroke} opacity="0.2"/>
        <path d="M7 8h6M7 11h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function FileCard({ file, onDelete }) {
  // Actual backend shape: { id, filename, note, subject, storage_path, created_at, download_url }
  const displayName = file.filename
  const meta = file.created_at
    ? new Date(file.created_at).toLocaleDateString()
    : null

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm(`Delete "${displayName}"?`)) return
    onDelete?.(file.id)
  }

  const navigate = useNavigate()

  function handleOpen() {
    navigate(`/files/${file.id}`)
  }

  return (
    <div className="card group cursor-pointer relative" onClick={handleOpen}>
      <FileIcon filename={file.filename} />

      <p className="text-[13px] font-medium text-ink-primary leading-snug mb-1.5 line-clamp-2">
        {displayName}
      </p>

      {file.note && (
        <p className="text-[12px] text-ink-secondary leading-snug mb-1 line-clamp-2">
          {file.note}
        </p>
      )}

      {meta && <p className="text-[11px] font-medium text-ink-secondary">{meta}</p>}

      {file.subject && (
        <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5
                         rounded-full bg-warm-tag text-warm-tag-text">
          {file.subject}
        </span>
      )}

      {/* Delete button — appears on hover */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100
                   transition-opacity p-1 rounded-md hover:bg-red-50 text-ink-muted hover:text-red-600"
        title="Delete file"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}