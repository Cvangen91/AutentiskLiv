import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../../features/auth/useAuth'

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
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pt-28 text-center text-stone-700 sm:px-6 lg:px-8">
        Laster kurs...
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pt-28 text-center text-stone-700 sm:px-6 lg:px-8">
        Feil: {errorMessage}
      </div>
    )
  }

  const selectedCourse = selectedProduct?.courses
  const selectedIsEnrolled =
    selectedCourse && myEnrollmentCourseIds.includes(selectedCourse.id)

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[1.75rem] border border-stone-200 bg-white/60 px-6 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
            Kurs
          </p>
          <p className="mt-2 max-w-3xl text-base leading-7 text-stone-700">
            Her kan dere legge inn en kort introduksjon eller en liten tekst om kursene før man klikker seg videre til detaljene under.
          </p>
        </section>

        {selectedProduct && (
          <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white/65 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#6f7c63] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Valgt kurs
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                {selectedCourse?.is_self_paced ? 'Selvstudium' : 'Med oppfølging'}
              </span>
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-semibold text-stone-900">
                  {selectedProduct.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-stone-700">
                  {selectedProduct.description}
                </p>

                <div className="mt-6 space-y-4 text-stone-700">
                  <p>
                    <span className="font-semibold text-stone-900">Intro:</span>{' '}
                    {selectedCourse?.intro_text || 'Ingen intro enda'}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-900">Format:</span>{' '}
                    {selectedCourse?.is_self_paced ? 'Selvstudium' : 'Med oppfølging'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <dt className="text-sm font-medium text-stone-500">Pris</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-900">
                    {selectedProduct.price_nok} NOK
                  </dd>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <dt className="text-sm font-medium text-stone-500">Nivå</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-900">
                    {selectedCourse?.difficulty_level || 'Ikke satt'}
                  </dd>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {selectedIsEnrolled ? (
                <button
                  type="button"
                  className="rounded-2xl bg-stone-200 px-5 py-3 font-semibold text-stone-600"
                >
                  Allerede påmeldt
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-2xl bg-[#6f7c63] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
                  onClick={() => handleEnrollClick(selectedProduct)}
                >
                  Meld deg på
                </button>
              )}

              <button
                type="button"
                className="rounded-2xl border border-stone-200 px-5 py-3 font-semibold text-stone-700 transition hover:bg-stone-50"
                onClick={() => setSelectedProduct(null)}
              >
                Lukk
              </button>
            </div>
          </section>
        )}

        {courses.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white/60 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md">
            <p className="text-lg font-medium text-stone-700">Ingen publiserte kurs enda.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((product) => {
              const course = product.courses
              const isSelected = selectedProduct?.id === product.id
              const isEnrolled = course && myEnrollmentCourseIds.includes(course.id)

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className={`group relative overflow-hidden rounded-[2rem] border bg-white/70 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)] ${isSelected ? 'border-[#6f7c63] ring-4 ring-[#6f7c63]/10' : 'border-stone-200'}`}
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#6f7c63]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7c63]">
                      Kurs
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${isEnrolled ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                      {isEnrolled ? 'Påmeldt' : 'Ledig plass'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold text-stone-900">
                    {product.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">
                    {product.description}
                  </p>

                  <div className="mt-6 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Pris</p>
                      <p className="mt-1 text-base font-semibold text-stone-900">{product.price_nok} NOK</p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Format</p>
                      <p className="mt-1 text-base font-semibold text-stone-900">
                        {course?.is_self_paced ? 'Selvstudium' : 'Med oppfølging'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-stone-200 pt-5">
                    <span className="rounded-full bg-[#6f7c63] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[#617255]">
                      Mer info
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Courses