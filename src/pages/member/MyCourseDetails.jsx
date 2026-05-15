import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../../features/auth/useAuth'
import './MyCourseDetails.css'

function formatCourseDate(value) {
  if (!value) {
    return 'Fast/løpende kurs'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Ugyldig dato'
    : date.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })
}

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
          has_capacity_limit,
          capacity_limit,
          delivery_mode,
          start_at,
          location_text,
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
      <div className="my-course__inner">
        <div className="my-course__header">
          <div className="my-course__header-top">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-lg bg-[#6f7c63] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              ← Tilbake til profil
            </button>
          </div>

          <h1 className="my-course__title">{product?.title}</h1>

          <p className="my-course__text my-course__description">{product?.description}</p>
        </div>

        {courseData?.delivery_mode === 'physical' && (
          <div className="my-course__card">
            <p className="my-course__text">
              <strong>Plasser:</strong>{' '}
              {courseData?.has_capacity_limit ? courseData?.capacity_limit : 'Ingen begrensning'}
            </p>
            <p className="my-course__text">
              <strong>Type:</strong>{' '}
              Fysisk
            </p>
            <p className="my-course__text">
              <strong>Tid:</strong> {formatCourseDate(courseData?.start_at)}
            </p>
            <p className="my-course__text">
              <strong>Sted:</strong> {courseData?.location_text || 'Ikke satt'}
            </p>
          </div>
        )}

        <section className="my-course__content">
          <h2 className="my-course__section-title">Kursinnhold</h2>
          <p className="my-course__text">
            Her kan dere senere vise video, bilder, tekst, moduler og leksjoner.
          </p>
        </section>
      </div>
    </div>
  )
}

export default MyCourseDetails