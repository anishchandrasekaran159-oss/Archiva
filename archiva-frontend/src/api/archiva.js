// api/archiva.js
import { getAccessToken } from '../lib/supabase.js'

const BASE_URL = '/api'

async function request(path, options = {}) {
  const token = await getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export async function getFiles(subject = null) {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  const data = await request(`/files${params}`)
  return Array.isArray(data) ? data : (data.files ?? data.results ?? [])
}

export async function getFile(id) {
  return request(`/files/${id}`)
}

export async function deleteFile(id) {
  return request(`/files/${id}`, { method: 'DELETE' })
}

export async function uploadFile(file, meta = {}, onProgress) {
  const token = await getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('file', file)
  if (meta.title)   formData.append('note',    meta.title)
  if (meta.subject) formData.append('subject', meta.subject)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}/upload`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

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

export async function searchFiles(query, limit = 10) {
  const params = new URLSearchParams({ q: query, limit })
  return request(`/search?${params}`)
}