import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../features/auth/useAuth'
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

export default function AdminCoursesTab() {
  const { user } = useAuth()

  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [coursesError, setCoursesError] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const formRef = useRef(null)

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

  useEffect(() => {
    if (!isFormOpen) return

    const id = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)

    return () => clearTimeout(id)
  }, [isFormOpen])

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

    try {
      const payload = {
        title: formValues.title,
        slug: editingCourse?.slug || createSlug(formValues.title),
        description: formValues.description,
        price_nok: Number(formValues.priceNok),
        status: formValues.status,
      }

      let coverImageUrl = editingCourse?.coverImageUrl || null

      if (editingCourse) {
        if (formValues.coverImageFile) {
          try {
            coverImageUrl = await uploadCourseImage(formValues.coverImageFile, editingCourse.id)
          } catch (uploadError) {
            throw new Error(`Feil ved opplasting av bilde: ${uploadError.message}`)
          }
        }

        const { error: productError } = await supabase
          .from('products')
          .update({
            ...payload,
            cover_image_url: coverImageUrl,
          })
          .eq('id', editingCourse.id)

        if (productError) {
          throw new Error(`Feil ved oppdatering av produkt: ${productError.message}`)
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
            throw new Error(`Feil ved oppdatering av kurs: ${courseError.message}`)
          }
        } else {
          const { error: courseError } = await supabase
            .from('courses')
            .insert({
              product_id: editingCourse.id,
              ...coursePayload,
            })

          if (courseError) {
            throw new Error(`Produkt oppdatert, men feil ved oppretting av kursdetaljer: ${courseError.message}`)
          }
        }

        setMessage('Kurs oppdatert!')
        await refreshCourses()
        setSelectedCourse(null)
        setIsFormOpen(false)
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
          throw new Error(`Feil ved lagring av produkt: ${productError.message}`)
        }

        if (formValues.coverImageFile) {
          try {
            coverImageUrl = await uploadCourseImage(formValues.coverImageFile, product.id)
          } catch (uploadError) {
            throw new Error(`Produkt lagret, men feil ved opplasting av bilde: ${uploadError.message}`)
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
          throw new Error(`Produkt lagret, men feil ved oppretting av kurs: ${courseError.message}`)
        }

        setMessage('Kurs opprettet!')
        await refreshCourses()
        setIsFormOpen(false)
      }
    } catch (err) {
      setMessage(err.message || 'En uventet feil oppstod under lagring. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  if (coursesError) {
    return <div className="text-red-600">Feil: {coursesError}</div>
  }

  if (loadingCourses) {
    return <div className="text-stone-600">Laster inn kurs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-lg bg-[#6f7c63] px-4 py-2 font-medium text-white transition hover:bg-[#617255]"
          onClick={() => {
            setSelectedCourse(null)
            setIsFormOpen(!isFormOpen)
          }}
        >
          {isFormOpen ? 'Avbryt' : '+ Nytt kurs'}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.toLowerCase().includes('feil') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
        >
          {message}
        </div>
      )}

      {isFormOpen && (
        <div ref={formRef}>
          <AdminCourseForm
            course={selectedCourse}
            onSubmit={handleSaveCourse}
            loading={loading}
            onCancelEditing={() => {
              setSelectedCourse(null)
              setIsFormOpen(false)
            }}
          />
        </div>
      )}

      <AdminCourseList
        courses={courses}
        onEdit={(course) => {
          setSelectedCourse(course)
          setIsFormOpen(true)
        }}
      />
    </div>
  )
}
