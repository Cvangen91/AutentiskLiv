import { useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { getSession, onAuthStateChange } from '../../features/auth/authService'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await getSession()

      if (error) {
        console.error('Feil ved henting av session:', error.message)
      }

      const currentSession = data?.session ?? null

      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}