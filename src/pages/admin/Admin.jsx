import { useEffect, useState } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'
import AdminCourseForm from '../../components/admin/AdminCourseForm'
import AdminCourseList from '../../components/admin/AdminCourseList'

function toDatetimeLocalValue(isoValue) {
  if (!isoValue) {
    return ''
  }

  const date = new Date(isoValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

function toIsoString(datetimeLocalValue) {
  if (!datetimeLocalValue) {
    return null
  }

  const date = new Date(datetimeLocalValue)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function createSlug(value) {
  const base = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return base || `course-${Date.now()}`
}

async function uploadCourseImage(file, productId) {
  if (!file) {
    return null
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const filePath = `course-images/${productId}/${Date.now()}.${fileExtension}`

  const { error: uploadError } = await supabase.storage
    .from('course-images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from('course-images').getPublicUrl(filePath)
  return data.publicUrl || null
}

function normalizeCourse(row) {
  const course = Array.isArray(row.courses) ? row.courses[0] : row.courses

  return {
    id: row.id,
    title: row.title ?? '',
    slug: row.slug ?? '',
    description: row.description ?? '',
    priceNok: row.price_nok ?? '',
    status: row.status ?? 'draft',
    coverImageUrl: row.cover_image_url ?? '',
    courseId: course?.id ?? null,
    hasCapacityLimit: course?.has_capacity_limit ?? false,
    capacityLimit: course?.capacity_limit ?? '',
    deliveryMode: course?.delivery_mode ?? 'online',
    startAt: toDatetimeLocalValue(course?.start_at),
    locationText: course?.location_text ?? '',
    visibility: course?.visibility ?? 'public',
  }
}

function Admin() {
  const { user } = useAuth()
  const { role } = useRole()

  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [coursesError, setCoursesError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isListOpen, setIsListOpen] = useState(false)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true)
      setCoursesError('')

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          slug,
          description,
          price_nok,
          status,
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
        .order('id', { ascending: false })

      if (error) {
        setCoursesError(error.message)
        setCourses([])
      } else {
        setCourses((data || []).map(normalizeCourse))
      }

      setLoadingCourses(false)
    }

    fetchCourses()
  }, [])

  async function handleLogout() {
    await logout()
  }

  async function refreshCourses() {
    setLoadingCourses(true)
    setCoursesError('')

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        description,
        price_nok,
        status,
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
      .order('id', { ascending: false })

    if (error) {
      setCoursesError(error.message)
      setCourses([])
    } else {
      setCourses((data || []).map(normalizeCourse))
    }

    setLoadingCourses(false)
  }

  async function handleSaveCourse(formValues, editingCourse) {
    setMessage('')

    if (!user) {
      setMessage('Ingen innlogget bruker funnet.')
      return
    }

    if (formValues.hasCapacityLimit && (!formValues.capacityLimit || Number(formValues.capacityLimit) < 1)) {
      setMessage('Antall plasser må være minst 1 når plassbegrensning er aktivert.')
      return
    }

    if (formValues.deliveryMode === 'physical' && !String(formValues.locationText || '').trim()) {
      setMessage('Sted må fylles ut når kurset er fysisk.')
      return
    }

    setLoading(true)

    const payload = {
      title: formValues.title,
      slug: editingCourse?.slug || createSlug(formValues.title),
      description: formValues.description,
      price_nok: Number(formValues.priceNok),
      status: formValues.status,
    }

    let coverImageUrl = editingCourse?.coverImageUrl || null

    if (editingCourse) {
      try {
        if (formValues.coverImageFile) {
          coverImageUrl = await uploadCourseImage(formValues.coverImageFile, editingCourse.id)
        }
      } catch (uploadError) {
        setMessage(`Feil ved opplasting av bilde: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { error: productError } = await supabase
        .from('products')
        .update({
          ...payload,
          cover_image_url: coverImageUrl,
        })
        .eq('id', editingCourse.id)

      if (productError) {
        setMessage(`Feil ved oppdatering av produkt: ${productError.message}`)
        setLoading(false)
        return
      }

      const coursePayload = {
        has_capacity_limit: formValues.hasCapacityLimit,
        capacity_limit: formValues.hasCapacityLimit ? Number(formValues.capacityLimit) : null,
        delivery_mode: formValues.deliveryMode,
        start_at: toIsoString(formValues.startAt),
        location_text:
          formValues.deliveryMode === 'physical' ? formValues.locationText || null : null,
      }

      if (editingCourse.courseId) {
        const { error: courseError } = await supabase
          .from('courses')
          .update(coursePayload)
          .eq('id', editingCourse.courseId)

        if (courseError) {
          setMessage(`Feil ved oppdatering av kurs: ${courseError.message}`)
          setLoading(false)
          return
        }
      } else {
        const { error: courseError } = await supabase
          .from('courses')
          .insert({
            product_id: editingCourse.id,
            ...coursePayload,
          })

        if (courseError) {
          setMessage(`Produkt oppdatert, men feil ved oppretting av kursdetaljer: ${courseError.message}`)
          setLoading(false)
          return
        }
      }

      setMessage('Kurs oppdatert!')
    } else {
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          ...payload,
          product_type: 'course',
          created_by: user.id,
        })
        .select()
        .single()

      if (productError) {
        setMessage(`Feil ved lagring av produkt: ${productError.message}`)
        setLoading(false)
        return
      }

      try {
        if (formValues.coverImageFile) {
          coverImageUrl = await uploadCourseImage(formValues.coverImageFile, product.id)
        }
      } catch (uploadError) {
        setMessage(`Produkt lagret, men feil ved opplasting av bilde: ${uploadError.message}`)
        setLoading(false)
        return
      }

      if (coverImageUrl) {
        const { error: imageUpdateError } = await supabase
          .from('products')
          .update({ cover_image_url: coverImageUrl })
          .eq('id', product.id)

        if (imageUpdateError) {
          setMessage(`Produkt lagret, men feil ved lagring av bilde-URL: ${imageUpdateError.message}`)
          setLoading(false)
          return
        }
      }

      const { error: courseError } = await supabase
        .from('courses')
        .insert({
          product_id: product.id,
          has_capacity_limit: formValues.hasCapacityLimit,
          capacity_limit: formValues.hasCapacityLimit ? Number(formValues.capacityLimit) : null,
          delivery_mode: formValues.deliveryMode,
          start_at: toIsoString(formValues.startAt),
          location_text:
            formValues.deliveryMode === 'physical' ? formValues.locationText || null : null,
        })

      if (courseError) {
        setMessage(`Produkt lagret, men feil ved lagring av kurs: ${courseError.message}`)
        setLoading(false)
        return
      }

      setMessage('Produkt og kurs lagret!')
    }

    await refreshCourses()
    setSelectedCourse(null)
    setIsFormOpen(false)
    setLoading(false)
  }

  async function handlePublishCourse(course) {
    setMessage('')
    setLoading(true)

    const { error } = await supabase
      .from('products')
      .update({ status: 'published' })
      .eq('id', course.id)

    if (error) {
      setMessage(`Feil ved publisering: ${error.message}`)
      setLoading(false)
      return
    }

    setMessage('Kurs publisert!')
    await refreshCourses()
    setLoading(false)
  }

  async function handleDeleteCourse(course) {
    const confirmed = window.confirm(`Vil du slette kurset "${course.title}"?`)

    if (!confirmed) {
      return
    }

    setMessage('')
    setLoading(true)

    if (course.courseId) {
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.courseId)

      if (courseError) {
        setMessage(`Feil ved sletting av kurs: ${courseError.message}`)
        setLoading(false)
        return
      }
    }

    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', course.id)

    if (productError) {
      setMessage(`Kurs slettet, men feil ved sletting av produkt: ${productError.message}`)
      setLoading(false)
      await refreshCourses()
      return
    }

    setMessage('Kurs slettet!')
    if (selectedCourse?.id === course.id) {
      setSelectedCourse(null)
      setIsFormOpen(false)
    }
    await refreshCourses()
    setLoading(false)
  }

  function handleEditCourse(course) {
    setSelectedCourse(course)
    setIsFormOpen(true)
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
            Admin
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Opprett og administrer kurs
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                Her kan du opprette nye kurs og fylle inn innhold som senere vises i kursoversikten.
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#6f7c63]/10 p-5 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Innlogget som
                </p>
                <p className="mt-2 break-words text-base font-semibold text-stone-900">
                  {user?.email}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Rolle
                </p>
                <p className="mt-2 text-base font-semibold text-stone-900">
                  {role}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
            >
              Logg ut
            </button>
          </div>
        </section>

        <details
          open={isFormOpen}
          onToggle={(event) => setIsFormOpen(event.currentTarget.open)}
          className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <summary className="cursor-pointer list-none rounded-[2rem] px-6 py-5 text-stone-900 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
                  Kurs
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  {selectedCourse ? 'Rediger kurs' : 'Opprett kurs'}
                </h2>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                Klikk for å åpne
              </span>
            </div>
          </summary>

          <div className="border-t border-stone-200 px-6 pb-6 pt-2 sm:px-8 sm:pb-8">
            <AdminCourseForm
              course={selectedCourse}
              loading={loading}
              onSubmit={handleSaveCourse}
              onCancelEditing={() => setSelectedCourse(null)}
            />
          </div>
        </details>

        <details
          open={isListOpen}
          onToggle={(event) => setIsListOpen(event.currentTarget.open)}
          className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <summary className="cursor-pointer list-none rounded-[2rem] px-6 py-5 text-stone-900 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
                  Kurs
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  Kursliste
                </h2>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                Klikk for å åpne
              </span>
            </div>
          </summary>

          <div className="border-t border-stone-200 px-6 pb-6 pt-2 sm:px-8 sm:pb-8">
            <AdminCourseList
              courses={courses}
              loading={loadingCourses}
              error={coursesError}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onPublish={handlePublishCourse}
            />
          </div>
        </details>

        {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
      </div>
    </div>
  )
}

export default Admin