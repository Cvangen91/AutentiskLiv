import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../../features/auth/useAuth'
import './MyCourseDetails.css'

function MyCourseDetails() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchCourse() {
      if (!user) return

      setLoading(true)
      setErrorMessage('')

      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (enrollmentError) {
        setErrorMessage(enrollmentError.message)
        setLoading(false)
        return
      }

      if (!enrollment) {
        setErrorMessage('Du har ikke tilgang til dette kurset.')
        setLoading(false)
        return
      }

      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          intro_text,
          difficulty_level,
          is_self_paced,
          visibility,
          products (
            id,
            title,
            description,
            cover_image_url,
            price_nok
          )
        `)
        .eq('id', courseId)
        .single()

      if (courseError) {
        setErrorMessage(courseError.message)
        setLoading(false)
        return
      }

      setCourseData(course)
      setLoading(false)
    }

    fetchCourse()
  }, [user, courseId])

  if (loading) {
    return <p className="my-course__message">Laster kurs...</p>
  }

  if (errorMessage) {
    return (
      <div className="my-course">
        <p className="my-course__message">{errorMessage}</p>
        <button
          type="button"
          className="my-course__back-button"
          onClick={() => navigate('/profile')}
        >
          Tilbake til profil
        </button>
      </div>
    )
  }

  const product = courseData?.products

  return (
    <div className="my-course">
      <button
        type="button"
        className="my-course__back-button"
        onClick={() => navigate('/profile')}
      >
        ← Tilbake til profil
      </button>

      <h1 className="my-course__title">{product?.title}</h1>

      <div className="my-course__card">
        <p className="my-course__text">{product?.description}</p>
        <p className="my-course__text">
          <strong>Intro:</strong> {courseData?.intro_text || 'Ingen intro enda'}
        </p>
        <p className="my-course__text">
          <strong>Nivå:</strong> {courseData?.difficulty_level || 'Ikke satt'}
        </p>
        <p className="my-course__text">
          <strong>Format:</strong>{' '}
          {courseData?.is_self_paced ? 'Selvstudium' : 'Med oppfølging'}
        </p>
      </div>

      <section className="my-course__content">
        <h2 className="my-course__section-title">Kursinnhold</h2>
        <p className="my-course__text">
          Her kan dere senere vise video, bilder, tekst, moduler og leksjoner.
        </p>
      </section>
    </div>
  )
}

export default MyCourseDetails