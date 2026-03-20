// api/archiva.js
// All backend calls live here. Update BASE_URL to match your FastAPI server.
// In dev, Vite proxies /api → http://localhost:8000 (see vite.config.js).

const BASE_URL = '/api'

// ─── Helper ──────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  // 204 No Content has no body
  if (res.status === 204) return null
  return res.json()
}

// ─── Files ───────────────────────────────────────────────────────────────────

/** GET /files — list all uploaded files, optionally filtered by subject */
export async function getFiles(subject = null) {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  const data = await request(`/files${params}`)
  // Handle both a raw array and a wrapped { files: [...] } response
  return Array.isArray(data) ? data : (data.files ?? data.results ?? [])
}

/** GET /files/:id — get a single file's metadata */
export async function getFile(id) {
  return request(`/files/${id}`)
}

/** DELETE /files/:id — delete a file */
export async function deleteFile(id) {
  return request(`/files/${id}`, { method: 'DELETE' })
}

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * POST /upload — upload and embed a file
 * @param {File}   file     - the File object from an input or drop event
 * @param {object} meta     - { title, subject, type } extra metadata
 * @param {function} onProgress - optional callback (0–100) for upload progress
 */
export async function uploadFile(file, meta = {}, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  if (meta.title)   formData.append('note',    meta.title)
  if (meta.subject) formData.append('subject', meta.subject)

  // Use XMLHttpRequest so we can track upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}/upload`)

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        const err = JSON.parse(xhr.responseText || '{}')
        reject(new Error(err.detail || 'Upload failed'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    xhr.send(formData)
  })
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * GET /search?q=... — semantic search
 * @param {string} query - natural language query
 * @param {number} limit - max results (default 10)
 */
export async function searchFiles(query, limit = 10) {
  const params = new URLSearchParams({ q: query, limit })
  return request(`/search?${params}`)
}