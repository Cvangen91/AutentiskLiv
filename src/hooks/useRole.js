import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/useAuth'
import { getUserProfile } from '../features/users/userService'

export function useRole() {
  const { user } = useAuth()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      const { data, error } = await getUserProfile(user.id)

      if (error) {
        console.error('Feil ved henting av rolle:', error.message)
        setLoading(false)
        return
      }

      setRole(data?.role ?? null)
      setLoading(false)
    }

    fetchRole()
  }, [user])

  return { role, loading }
}