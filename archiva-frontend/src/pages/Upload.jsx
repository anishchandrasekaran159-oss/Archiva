// pages/Upload.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle } from 'lucide-react'
import { uploadFile } from '../api/archiva.js'

const SUBJECTS = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'English']
const TYPES    = ['Notes', 'Question Paper', 'Reference', 'Diagram', 'Syllabus']

export default function Upload() {
  const navigate  = useNavigate()
  const inputRef  = useRef()
  const [dragging, setDragging]   = useState(false)
  const [file, setFile]           = useState(null)
  const [title, setTitle]         = useState('')
  const [subject, setSubject]     = useState(SUBJECTS[0])
  const [type, setType]           = useState(TYPES[0])
  const [progress, setProgress]   = useState(0)
  const [status, setStatus]       = useState('idle')
  const [errorMsg, setErrorMsg]   = useState('')

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }

  function pickFile(f) {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  async function handleSubmit() {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    try {
      await uploadFile(file, { title, subject, type }, pct => setProgress(pct))
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex-1 h-full overflow-y-auto flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-warm-tag flex items-center justify-center">
          <CheckCircle size={28} className="text-warm-tag-text" strokeWidth={2} />
        </div>
        <p className="text-base font-medium text-ink-primary">File uploaded and indexed</p>
        <p className="text-sm font-medium text-ink-secondary text-center max-w-xs">
          Archiva embedded your resource. It's now searchable semantically across your library.
        </p>
        <div className="flex gap-2.5 mt-2">
          <button onClick={() => navigate('/')} className="btn-primary">Go to Library</button>
          <button onClick={() => { setFile(null); setTitle(''); setProgress(0); setStatus('idle') }}
                  className="btn-ghost">Upload another</button>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full overflow-y-auto flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <p className="text-[15px] font-medium text-ink-secondary font-serif mb-6 text-center">Upload a resource</p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                      transition-colors mb-5
                      ${dragging || file
                        ? 'border-warm-accent bg-warm-pale'
                        : 'border-warm-border bg-[#FFF5EB] hover:border-warm-accent hover:bg-warm-pale'}`}
        >
          <div className="w-10 h-10 rounded-full bg-warm-tag flex items-center justify-center mx-auto mb-2.5">
            <UploadCloud size={20} className="text-warm-accent" />
          </div>
          {file ? (
            <>
              <p className="text-sm font-medium text-ink-primary">{file.name}</p>
              <p className="text-xs font-medium text-ink-muted mt-0.5">
                {(file.size / 1024).toFixed(0)} KB · Click to change
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-ink-primary">Drop files here or click to browse</p>
              <p className="text-xs font-medium text-ink-secondary mt-1">PDF, DOCX, PPTX, PNG, JPG — up to 50 MB</p>
            </>
          )}
          <input ref={inputRef} type="file" className="hidden"
                 accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                 onChange={e => e.target.files[0] && pickFile(e.target.files[0])} />
        </div>

        {/* Form */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-ink-primary mb-1.5">Resource title</label>
          <input className="field" value={title} onChange={e => setTitle(e.target.value)}
                 placeholder="e.g. Haloalkanes — Chapter Notes" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-[13px] font-medium text-ink-primary mb-1.5">Subject</label>
            <select className="field" value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-primary mb-1.5">Type</label>
            <select className="field" value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {status === 'uploading' && (
          <div className="mb-4">
            <div className="h-1.5 bg-warm-stat rounded-full overflow-hidden">
              <div className="h-full bg-warm-accent rounded-full transition-all duration-200"
                   style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs font-medium text-ink-muted mt-1">{progress}% uploaded…</p>
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm font-medium text-red-600 mb-4">{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || status === 'uploading'}
          className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'uploading' ? 'Uploading…' : 'Upload & Index'}
        </button>

        <p className="text-xs font-medium text-ink-secondary text-center mt-3">
          Archiva will keep your file safe. Grab it whenever you need it.
        </p>
      </div>
    </div>
  )
}