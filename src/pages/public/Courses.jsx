import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../../features/auth/useAuth'
import './Courses.css'

function Courses() {
  const [courses, setCourses] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [myEnrollmentCourseIds, setMyEnrollmentCourseIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchCoursesAndEnrollments() {
      setLoading(true)
      setErrorMessage('')

      const { data: coursesData, error: coursesError } = await supabase
        .from('products')
        .select(`
          id,
          title,
          slug,
          description,
          price_nok,
          cover_image_url,
          courses (
            id,
            intro_text,
            difficulty_level,
            is_self_paced,
            visibility
          )
        `)
        .eq('product_type', 'course')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (coursesError) {
        setErrorMessage(coursesError.message)
        setLoading(false)
        return
      }

      setCourses(coursesData || [])

      if (user) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)

        if (enrollmentError) {
          setErrorMessage(enrollmentError.message)
          setLoading(false)
          return
        }

        setMyEnrollmentCourseIds((enrollmentData || []).map((item) => item.course_id))
      } else {
        setMyEnrollmentCourseIds([])
      }

      setLoading(false)
    }

    fetchCoursesAndEnrollments()
  }, [user])

  async function handleEnrollClick(product) {
    if (!user) {
      navigate('/login')
      return
    }

    const course = product.courses

    if (!course) {
      alert('Fant ikke tilhørende kurs.')
      return
    }

    const { data: existingEnrollment, error: checkError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()

    if (checkError) {
      alert(`Feil ved sjekk av påmelding: ${checkError.message}`)
      return
    }

    if (existingEnrollment) {
      alert('Du er allerede meldt på dette kurset.')
      return
    }

    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: course.id,
      status: 'active',
    })

    if (error) {
      alert(`Feil ved påmelding: ${error.message}`)
      return
    }

    setMyEnrollmentCourseIds((prev) => [...prev, course.id])
    alert('Du er nå meldt på kurset!')
  }

  function handleSelectProduct(product) {
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null)
      return
    }

    setSelectedProduct(product)
  }

  if (loading) {
    return <p className="courses-page__loading">Laster kurs...</p>
  }

  if (errorMessage) {
    return <p className="courses-page__error">Feil: {errorMessage}</p>
  }

  const selectedCourse = selectedProduct?.courses
  const selectedIsEnrolled =
    selectedCourse && myEnrollmentCourseIds.includes(selectedCourse.id)

  return (
    <div className="courses-page">
      <h1 className="courses-page__title">Kurs</h1>

      {selectedProduct && (
        <section className="courses-page__selected">
          <h2 className="courses-page__selected-title">{selectedProduct.title}</h2>
          <p className="courses-page__selected-text">{selectedProduct.description}</p>
          <p className="courses-page__selected-text">
            <strong>Pris:</strong> {selectedProduct.price_nok} NOK
          </p>
          <p className="courses-page__selected-text">
            <strong>Intro:</strong> {selectedCourse?.intro_text || 'Ingen intro enda'}
          </p>
          <p className="courses-page__selected-text">
            <strong>Nivå:</strong> {selectedCourse?.difficulty_level || 'Ikke satt'}
          </p>
          <p className="courses-page__selected-text">
            <strong>Format:</strong>{' '}
            {selectedCourse?.is_self_paced ? 'Selvstudium' : 'Med oppfølging'}
          </p>

          <div className="courses-page__actions">
            {selectedIsEnrolled ? (
              <button type="button" className="courses-page__secondary-button">
                Allerede påmeldt
              </button>
            ) : (
              <button
                type="button"
                className="courses-page__primary-button"
                onClick={() => handleEnrollClick(selectedProduct)}
              >
                Meld deg på
              </button>
            )}

            <button
              type="button"
              className="courses-page__secondary-button"
              onClick={() => setSelectedProduct(null)}
            >
              Lukk
            </button>
          </div>
        </section>
      )}

      {courses.length === 0 ? (
        <p className="courses-page__empty">Ingen publiserte kurs enda.</p>
      ) : (
        <div className="courses-page__grid">
          {courses.map((product) => {
            const course = product.courses
            const isSelected = selectedProduct?.id === product.id
            const isEnrolled = course && myEnrollmentCourseIds.includes(course.id)

            return (
              <button
                key={product.id}
                type="button"
                className={`course-card ${isSelected ? 'course-card--active' : ''}`}
                onClick={() => handleSelectProduct(product)}
              >
                <h2 className="course-card__title">{product.title}</h2>
                <p className="course-card__text">{product.description}</p>
                <p className="course-card__text">Pris: {product.price_nok} NOK</p>
                <p className="course-card__status">
                  {isEnrolled ? 'Allerede påmeldt' : 'Klikk for mer info'}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Courses