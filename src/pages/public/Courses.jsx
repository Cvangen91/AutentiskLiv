import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../../features/auth/useAuth'
import defaultCourseImage from '../../constants/defaultCourseImage'

function formatCourseDate(value) {
  if (!value) return 'Fast/løpende kurs'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Ugyldig dato'

  return date.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatTimeSlotRange(startValue, endValue) {
  if (!startValue || !endValue) {
    return 'Ukjent tid'
  }

  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Ugyldig tid'
  }

  return `${start.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })} - ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`
}

function hasValidCapacity(courseInfo) {
  if (!courseInfo?.has_capacity_limit) {
    return false
  }

  const capacity = Number(courseInfo.capacity_limit)
  return Number.isFinite(capacity) && capacity > 0
}

function hasValidStartAt(value) {
  if (!value) {
    return false
  }

  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('')
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false)
  const [timeSlotsError, setTimeSlotsError] = useState('')
  const [nextAvailableTimeSlot, setNextAvailableTimeSlot] = useState(null)
  const [myEnrollmentCourseIds, setMyEnrollmentCourseIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const selectedSectionRef = useRef(null)

  useEffect(() => {
    async function fetchCoursesAndEnrollments() {
      setLoading(true)
      setErrorMessage('')

      const { data: coursesData, error: coursesError } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price_nok,
          cover_image_url,
          courses (
            id,
            has_capacity_limit,
            capacity_limit,
            delivery_mode,
            start_at,
            location_text,
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

  useEffect(() => {
    let isActive = true

    async function fetchNextSlot() {
      const { data, error } = await supabase
        .from('time_slots')
        .select('id, start_time, end_time, notes')
        .eq('status', 'available')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!isActive) return

      if (error) {
        setNextAvailableTimeSlot(null)
        return
      }

      setNextAvailableTimeSlot(data || null)
    }

    fetchNextSlot()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    const selectedCourse = selectedProduct?.courses

    if (!selectedCourse || selectedCourse.delivery_mode !== 'one_to_one') {
      setAvailableTimeSlots([])
      setSelectedTimeSlotId('')
      setTimeSlotsError('')
      setTimeSlotsLoading(false)
      return
    }

    let isActive = true

    async function fetchTimeSlots() {
      setTimeSlotsLoading(true)
      setTimeSlotsError('')

      const { data, error } = await supabase
        .from('time_slots')
        .select('id, start_time, end_time, notes')
        .eq('status', 'available')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      if (!isActive) {
        return
      }

      if (error) {
        setTimeSlotsError(error.message)
        setAvailableTimeSlots([])
      } else {
        setAvailableTimeSlots(data || [])
      }

      setTimeSlotsLoading(false)
    }

    fetchTimeSlots()
    return () => {
      isActive = false
    }
  }, [selectedProduct])

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
      setSelectedTimeSlotId('')
      return
    }

    setSelectedProduct(product)
  }

  useEffect(() => {
    if (!selectedProduct) return

    const id = setTimeout(() => {
      const section = selectedSectionRef.current

      if (section) {
        const yOffset = -110
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
      
        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
      }    }, 80)

    return () => clearTimeout(id)
  }, [selectedProduct])

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
  const selectedIsEnrolled = selectedCourse && myEnrollmentCourseIds.includes(selectedCourse.id)
  const selectedIsOneToOne = selectedCourse?.delivery_mode === 'one_to_one'
  const showAlreadyEnrolledState = selectedIsEnrolled && !selectedIsOneToOne
  const selectedTimeSlot = availableTimeSlots.find((slot) => slot.id === selectedTimeSlotId)
  const canProceedToCheckout =
    !selectedCourse || !selectedIsOneToOne || Boolean(selectedTimeSlot)

  return (
<div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-8 text-stone-900 sm:px-6 lg:px-16">      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[1.75rem] border border-stone-200 bg-white/60 px-6 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur-md sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Kurs</p>
          <p className="mt-2 max-w-3xl text-base leading-7 text-stone-700">
            Hos Autentisk Liv tilbys kurs og events innen healing, energiarbeid, personlig utvikling,
            workshops og events. Arrangementene passer både for deg som er nysgjerrig og for deg som
            ønsker å gå dypere i egen utviklingsreise.
          </p>
        </section>

        {selectedProduct && (
          <section ref={selectedSectionRef} className="mb-8 rounded-[2rem] border border-stone-200 bg-white/65 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-semibold text-stone-900">{selectedProduct.title}</h2>
                <p className="mt-4 text-base leading-8 text-stone-700">{selectedProduct.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <dt className="text-sm font-medium text-stone-500">Pris</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-900">{selectedProduct.price_nok} NOK</dd>
                </div>
                {selectedCourse?.has_capacity_limit && (
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <dt className="text-sm font-medium text-stone-500">Plasser</dt>
                    <dd className="mt-1 text-lg font-semibold text-stone-900">{selectedCourse.capacity_limit}</dd>
                  </div>
                )}
                {hasValidStartAt(selectedCourse?.start_at) && (
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <dt className="text-sm font-medium text-stone-500">Oppstart</dt>
                    <dd className="mt-1 text-lg font-semibold text-stone-900">
                      {formatCourseDate(selectedCourse.start_at)}
                    </dd>
                  </div>
                )}
                {selectedCourse?.delivery_mode === 'physical' && selectedCourse?.location_text && (
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <dt className="text-sm font-medium text-stone-500">Sted</dt>
                    <dd className="mt-1 text-lg font-semibold text-stone-900">{selectedCourse.location_text}</dd>
                  </div>
                )}

                {selectedCourse?.delivery_mode === 'one_to_one' && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-sm font-medium text-stone-500">Ledige tider</dt>
                      {selectedTimeSlot && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          Valgt
                        </span>
                      )}
                    </div>

                    {timeSlotsLoading ? (
                      <p className="mt-3 text-sm text-stone-600">Laster ledige tider...</p>
                    ) : timeSlotsError ? (
                      <p className="mt-3 text-sm text-red-700">Kunne ikke laste ledige tider: {timeSlotsError}</p>
                    ) : availableTimeSlots.length === 0 ? (
                      <p className="mt-3 text-sm text-stone-600">Ingen ledige tider er registrert ennå.</p>
                    ) : (
                      <div className="mt-3 grid gap-3">
                        {availableTimeSlots.map((slot) => {
                          const isSelected = selectedTimeSlotId === slot.id

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedTimeSlotId(slot.id)}
                              className={`rounded-2xl border px-4 py-3 text-left transition ${isSelected ? 'border-[#6f7c63] bg-[#f2f5ee] ring-4 ring-[#6f7c63]/10' : 'border-stone-200 bg-white hover:border-[#6f7c63]/50 hover:bg-stone-50'}`}
                            >
                              <p className="text-sm font-semibold text-stone-900">
                                {formatTimeSlotRange(slot.start_time, slot.end_time)}
                              </p>
                              {slot.notes && <p className="mt-1 text-sm text-stone-600">{slot.notes}</p>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="overflow-hidden rounded-[1.5rem] bg-stone-100 lg:mt-2 lg:w-full lg:max-w-[240px] lg:justify-self-end">
                  <img
                    src={selectedProduct.cover_image_url || defaultCourseImage}
                    alt={selectedProduct.title}
                    className="h-44 w-full object-cover sm:h-52 lg:h-56"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {showAlreadyEnrolledState ? (
                <button
                  type="button"
                  className="rounded-2xl bg-stone-200 px-5 py-3 font-semibold text-stone-600"
                >
                  Allerede påmeldt
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-2xl bg-[#6f7c63] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#617255] disabled:cursor-not-allowed disabled:bg-stone-300"
                  onClick={() => navigate(`/checkout/${selectedProduct.id}${selectedTimeSlotId ? `?slotId=${selectedTimeSlotId}` : ''}`)}
                  disabled={!canProceedToCheckout}
                >
                  {selectedCourse?.delivery_mode === 'one_to_one' ? 'Gå til betaling' : 'Meld deg på'}
                </button>
              )}

              {selectedIsOneToOne && !canProceedToCheckout && (
                <p className="flex items-center text-sm text-stone-600">
                  Velg en ledig tid før du går videre til betaling.
                </p>
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

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className={`group relative overflow-hidden rounded-[2rem] border bg-white/70 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)] ${isSelected ? 'border-[#6f7c63] ring-4 ring-[#6f7c63]/10' : 'border-stone-200'}`}
                >
                  <div className="mb-5 overflow-hidden rounded-[1.5rem] bg-stone-100">
                    <img
                      src={product.cover_image_url || defaultCourseImage}
                      alt={product.title}
                      className="h-52 w-full object-cover"
                    />
                  </div>

                  {/* badge moved to footer */}

                  <h2 className="text-2xl font-semibold text-stone-900">{product.title}</h2>
                  <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">{product.description}</p>

                  <div className="mt-6 text-sm text-stone-700">
                    <div className="w-full">
                      <div className="rounded-2xl bg-stone-50 px-4 py-3 w-full text-left">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Pris</p>
                        <p className="mt-1 text-base font-semibold text-stone-900">{product.price_nok} NOK</p>

                        {course?.delivery_mode === 'one_to_one' ? (
                          <div className="mt-3">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Neste ledige tid</p>
                            <p className="mt-1 text-sm font-semibold text-stone-900">
                              {nextAvailableTimeSlot ? formatTimeSlotRange(nextAvailableTimeSlot.start_time, nextAvailableTimeSlot.end_time) : 'Ingen ledige tider'}
                            </p>
                          </div>
                        ) : course?.delivery_mode === 'physical' ? (
                          <div className="mt-3">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Oppstart</p>
                            <p className="mt-1 text-sm font-semibold text-stone-900">
                              {hasValidStartAt(course.start_at) ? formatCourseDate(course.start_at) : 'Ikke satt'}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
                    {hasValidCapacity(course) ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                        Ledig plass
                      </span>
                    ) : (
                      <div />
                    )}

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
