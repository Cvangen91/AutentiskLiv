import { useEffect, useState } from 'react'
import defaultCourseImage from '../../constants/defaultCourseImage'

const defaultFormState = {
  title: '',
  description: '',
  priceNok: '',
  status: 'draft',
  coverImageFile: null,
  hasCapacityLimit: false,
  capacityLimit: '',
  deliveryMode: 'online',
  startAt: '',
  locationText: '',
}

function AdminCourseForm({ course, loading, onSubmit, onCancelEditing }) {
  const [formState, setFormState] = useState(defaultFormState)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  useEffect(() => {
    if (course) {
      setFormState({
        title: course.title ?? '',
        description: course.description ?? '',
        priceNok: course.priceNok ?? '',
        status: course.status ?? 'draft',
        coverImageFile: null,
        hasCapacityLimit: course.hasCapacityLimit ?? false,
        capacityLimit: course.capacityLimit ?? '',
        deliveryMode: course.deliveryMode ?? 'online',
        startAt: course.startAt ?? '',
        locationText: course.locationText ?? '',
      })
      return
    }

    setFormState(defaultFormState)
  }, [course])

  useEffect(() => {
    if (!formState.coverImageFile) {
      setImagePreviewUrl('')
      return
    }

    const previewUrl = URL.createObjectURL(formState.coverImageFile)
    setImagePreviewUrl(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [formState.coverImageFile])

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(formState, course)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-semibold text-stone-700">
            Tittel
          </label>
          <input
            id="title"
            type="text"
            value={formState.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="coverImageFile" className="text-sm font-semibold text-stone-700">
            Kursbilde
          </label>
          <input
            id="coverImageFile"
            type="file"
            accept="image/*"
            onChange={(event) => updateField('coverImageFile', event.target.files?.[0] || null)}
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#6f7c63] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#617255] focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
          <p className="text-xs text-stone-500">Last opp et bilde som vises på kurset. PNG, JPG eller WebP fungerer best.</p>
          {!formState.coverImageFile && (
            <img
              src={course?.coverImageUrl || defaultCourseImage}
              alt={course?.coverImageUrl ? 'Nåværende kursbilde' : 'Standard kursbilde'}
              className="mt-2 h-40 w-full rounded-2xl object-cover"
            />
          )}
          {imagePreviewUrl && (
            <img
              src={imagePreviewUrl}
              alt="Forhåndsvisning av nytt kursbilde"
              className="mt-2 h-40 w-full rounded-2xl object-cover"
            />
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-semibold text-stone-700">
          Beskrivelse
        </label>
        <textarea
          id="description"
          value={formState.description}
          onChange={(event) => updateField('description', event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="priceNok" className="text-sm font-semibold text-stone-700">
            Pris (NOK)
          </label>
          <input
            id="priceNok"
            type="number"
            value={formState.priceNok}
            onChange={(event) => updateField('priceNok', event.target.value)}
            required
            min="0"
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="status" className="text-sm font-semibold text-stone-700">
            Status
          </label>
          <select
            id="status"
            value={formState.status}
            onChange={(event) => updateField('status', event.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-2" />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="deliveryMode" className="text-sm font-semibold text-stone-700">
            Type kurs
          </label>
          <select
            id="deliveryMode"
            value={formState.deliveryMode}
            onChange={(event) => updateField('deliveryMode', event.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          >
            <option value="online">Nettbasert</option>
            <option value="physical">Fysisk</option>
            <option value="one_to_one">1:1 booking</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="startAt" className="text-sm font-semibold text-stone-700">
            Oppstart (dato og klokkeslett)
          </label>
          <input
            id="startAt"
            type="datetime-local"
            value={formState.startAt}
            onChange={(event) => updateField('startAt', event.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
          <p className="text-xs text-stone-500">Kan stå tom for faste/løpende kurs.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-2">
          <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={formState.hasCapacityLimit}
              onChange={(event) => {
                updateField('hasCapacityLimit', event.target.checked)
                if (!event.target.checked) {
                  updateField('capacityLimit', '')
                }
              }}
              className="h-4 w-4 rounded border-stone-300 text-[#6f7c63] focus:ring-[#6f7c63]"
            />
            Begrens antall plasser
          </label>

          <input
            id="capacityLimit"
            type="number"
            value={formState.capacityLimit}
            onChange={(event) => updateField('capacityLimit', event.target.value)}
            disabled={!formState.hasCapacityLimit}
            required={formState.hasCapacityLimit}
            min="1"
            placeholder="Antall plasser"
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition disabled:cursor-not-allowed disabled:bg-stone-100 focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="locationText" className="text-sm font-semibold text-stone-700">
            Sted (hvis kurs er fysisk)
          </label>
          <input
            id="locationText"
            type="text"
            value={formState.locationText}
            onChange={(event) => updateField('locationText', event.target.value)}
            disabled={formState.deliveryMode !== 'physical'}
            required={formState.deliveryMode === 'physical'}
            placeholder="F.eks. Oslo sentrum"
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition disabled:cursor-not-allowed disabled:bg-stone-100 focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Lagrer...' : course ? 'Oppdater kurs' : 'Lagre kurs'}
        </button>

        {course && (
          <button
            type="button"
            onClick={onCancelEditing}
            className="rounded-2xl border border-stone-200 px-5 py-3.5 font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Avbryt redigering
          </button>
        )}
      </div>
    </form>
  )
}

export default AdminCourseForm