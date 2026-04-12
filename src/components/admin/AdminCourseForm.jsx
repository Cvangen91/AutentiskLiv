import { useEffect, useState } from 'react'

const defaultFormState = {
  title: '',
  slug: '',
  description: '',
  priceNok: '',
  status: 'draft',
  introText: '',
  difficultyLevel: '',
  isSelfPaced: true,
}

function AdminCourseForm({ course, loading, onSubmit, onCancelEditing }) {
  const [formState, setFormState] = useState(defaultFormState)

  useEffect(() => {
    if (course) {
      setFormState({
        title: course.title ?? '',
        slug: course.slug ?? '',
        description: course.description ?? '',
        priceNok: course.priceNok ?? '',
        status: course.status ?? 'draft',
        introText: course.introText ?? '',
        difficultyLevel: course.difficultyLevel ?? '',
        isSelfPaced: course.isSelfPaced ?? true,
      })
      return
    }

    setFormState(defaultFormState)
  }, [course])

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
          <label htmlFor="slug" className="text-sm font-semibold text-stone-700">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={formState.slug}
            onChange={(event) => updateField('slug', event.target.value)}
            required
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
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
          <label htmlFor="introText" className="text-sm font-semibold text-stone-700">
            Introtekst
          </label>
          <textarea
            id="introText"
            value={formState.introText}
            onChange={(event) => updateField('introText', event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="difficultyLevel" className="text-sm font-semibold text-stone-700">
            Vanskelighetsgrad
          </label>
          <input
            id="difficultyLevel"
            type="text"
            value={formState.difficultyLevel}
            onChange={(event) => updateField('difficultyLevel', event.target.value)}
            placeholder="f.eks. beginner"
            className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
          />

          <label className="mt-3 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={formState.isSelfPaced}
              onChange={(event) => updateField('isSelfPaced', event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-[#6f7c63] focus:ring-[#6f7c63]"
            />
            Selvstudium
          </label>
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