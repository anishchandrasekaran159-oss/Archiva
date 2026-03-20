// pages/FileDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trash2, FileText } from 'lucide-react'
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

function isPDF(filename = '') {
  return getExt(filename) === 'pdf'
}

function isImage(filename = '') {
  return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(getExt(filename))
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

// ── Preview: Google Docs viewer to avoid Content-Disposition: attachment ──────
function FilePreview({ filename, url }) {
  if (!url) return null

  if (isPDF(filename)) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    return (
      <div className="flex flex-col h-full">
        <p className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-2">Preview</p>
        <div
          className="flex-1 rounded-xl overflow-hidden border-[1.5px] border-warm-border bg-gray-50"
          style={{ minHeight: '600px' }}
        >
          <iframe
            src={viewerUrl}
            title={filename}
            className="w-full h-full"
            style={{ border: 'none', minHeight: '600px' }}
          />
        </div>
      </div>
    )
  }

  if (isImage(filename)) {
    return (
      <div className="flex flex-col h-full">
        <p className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-2">Preview</p>
        <div className="flex-1 rounded-xl overflow-hidden border-[1.5px] border-warm-border bg-gray-50
                        flex items-center justify-center p-4">
          <img
            src={url}
            alt={filename}
            className="max-w-full max-h-[580px] object-contain rounded-lg"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-2">Preview</p>
      <div
        className="flex-1 rounded-xl border-[1.5px] border-dashed border-warm-border bg-gray-50
                   flex flex-col items-center justify-center gap-2"
        style={{ minHeight: '300px' }}
      >
        <FileText size={28} className="text-ink-muted opacity-40" />
        <p className="text-[13px] font-medium text-ink-muted">Preview not available</p>
        <p className="text-[11px] text-ink-muted opacity-70">Open the file to view its contents</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
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

  const file   = data?.file
  const recs   = data?.recommendations ?? []
  const date   = file?.created_at
    ? new Date(file.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const sizeMB = file?.file_size_bytes
    ? `${(file.file_size_bytes / (1024 * 1024)).toFixed(2)} MB`
    : null

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="p-8">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary
                     hover:text-ink-primary transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="flex gap-6 items-start">

          {/* ── LEFT — info + recommendations ── */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-4">

            <div className="bg-white border-[1.5px] border-warm-border rounded-xl p-5">

              <div className="flex items-start gap-3 mb-4">
                <FileTypeIcon filename={file.filename} size={48} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-[15px] font-medium text-ink-primary leading-tight mb-1 font-serif">
                    {file.filename}
                  </h1>
                  {file.note && (
                    <p className="text-[12px] text-ink-secondary leading-relaxed">{file.note}</p>
                  )}
                </div>
              </div>

              {/* Download button — saves file directly */}
              {file.download_url && (
                <a
                  href={file.download_url}
                  download={file.filename}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg
                             bg-warm-accent text-white text-[14px] font-semibold
                             hover:opacity-90 active:opacity-80 transition-opacity mb-4"
                >
                  <Download size={16} />
                  Download
                </a>
              )}

              <div className="border-t-[1.5px] border-warm-border mb-3" />

              <div className="flex flex-col gap-3">
                {file.subject && (
                  <div>
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">Subject</p>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-warm-tag text-warm-tag-text inline-block">
                      {file.subject}
                    </span>
                  </div>
                )}
                {date && (
                  <div>
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">Uploaded</p>
                    <p className="text-[12px] font-medium text-ink-primary">{date}</p>
                  </div>
                )}
                {sizeMB && (
                  <div>
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">File size</p>
                    <p className="text-[12px] font-medium text-ink-primary">{sizeMB}</p>
                  </div>
                )}
              </div>

              <div className="border-t-[1.5px] border-warm-border mt-4 pt-3 flex justify-end">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted hover:text-red-600 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete file
                </button>
              </div>
            </div>

            {recs.length > 0 && (
              <div className="bg-white border-[1.5px] border-warm-border rounded-xl p-5">
                <h2 className="text-[12px] font-medium text-ink-primary mb-3">You might also need</h2>
                <div className="flex flex-col gap-2">
                  {recs.map(rec => (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/files/${rec.id}`)}
                      className="flex gap-2.5 items-start cursor-pointer p-2 rounded-lg hover:bg-warm-tag transition-colors"
                    >
                      <FileTypeIcon filename={rec.filename} size={30} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-ink-primary leading-snug line-clamp-1">{rec.filename}</p>
                        {rec.note && (
                          <p className="text-[10px] text-ink-secondary line-clamp-1 mt-0.5">{rec.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT — preview ── */}
          <div className="flex-1 min-w-0">
            <FilePreview filename={file.filename} url={file.download_url} />
          </div>

        </div>
      </div>
    </div>
  )
}