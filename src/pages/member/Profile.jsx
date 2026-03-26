import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'
import './Profile.css'

function Profile() {
  const { user } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()

  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogout() {
    await logout()
  }

  useEffect(() => {
    async function fetchMyCourses() {
      if (!user) return

      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          courses (
            id,
            product_id,
            products (
              id,
              title,
              description,
              cover_image_url
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        setErrorMessage(error.message)
      } else {
        setMyCourses(data || [])
      }

      setLoading(false)
    }

    fetchMyCourses()
  }, [user])

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Profil</h1>

      <div className="profile-page__info">
        <p>Innlogget som: {user?.email}</p>
        <p>Rolle: {role}</p>
      </div>

      <button
        onClick={handleLogout}
        className="profile-page__logout-button"
      >
        Logg ut
      </button>

      <h2 className="profile-page__section-title">Mine kurs</h2>

      {loading ? (
        <p className="profile-page__message">Laster kurs...</p>
      ) : errorMessage ? (
        <p className="profile-page__message">Feil: {errorMessage}</p>
      ) : myCourses.length === 0 ? (
        <p className="profile-page__message">
          Du er ikke meldt på noen kurs enda.
        </p>
      ) : (
        <div className="profile-page__grid">
          {myCourses.map((enrollment) => {
            const course = enrollment.courses
            const product = course?.products

            return (
              <button
                key={enrollment.id}
                type="button"
                className="profile-course-card"
                onClick={() => navigate(`/my-courses/${course.id}`)}
              >
                <h3 className="profile-course-card__title">
                  {product?.title}
                </h3>
                <p className="profile-course-card__text">
                  {product?.description}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Profile