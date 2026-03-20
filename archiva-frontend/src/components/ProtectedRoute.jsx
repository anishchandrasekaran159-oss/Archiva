// src/components/ProtectedRoute.jsx
// Wraps any route that requires the user to be logged in.
// Mental model: it's a gatekeeper. Before rendering children,
// it checks if Supabase has a valid session. If not → /login.
// While it's checking → show nothing (avoids a flash of protected content).

import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for sign-in / sign-out events so the UI reacts in real time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still loading — render nothing to avoid flash
  if (session === undefined) return null

  // No session → redirect to login
  if (!session) return <Navigate to="/login" replace />

  // Has session → render the actual page
  return children
}