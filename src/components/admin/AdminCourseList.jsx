import defaultCourseImage from '../../constants/defaultCourseImage'

function AdminCourseList({ courses, loading, error, onEdit, onDelete, onPublish }) {
  function formatStartAt(value) {
    if (!value) {
      return 'Fast/løpende kurs'
    }

    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Ugyldig dato'
      : date.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return <p className="text-stone-700">Laster kurs...</p>
  }

  if (error) {
    return <p className="text-stone-700">Feil: {error}</p>
  }

  if (courses.length === 0) {
    return <p className="text-stone-700">Ingen kurs funnet.</p>
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => {
        const isPublished = course.status === 'published'

        return (
          <article
            key={course.id}
            className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
          >
            <div className="mb-5 overflow-hidden rounded-[1.5rem] bg-stone-100">
              <img
                src={course.coverImageUrl || defaultCourseImage}
                alt={course.title}
                className="h-52 w-full object-cover"
              />
            </div>

            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#6f7c63]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7c63]">
                Kurs
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                {course.status}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-stone-900">
              {course.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">
              {course.description}
            </p>

            <div className="mt-6 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Pris</p>
                <p className="mt-1 text-base font-semibold text-stone-900">{course.priceNok} NOK</p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Type</p>
                <p className="mt-1 text-base font-semibold text-stone-900">
                  {course.deliveryMode === 'physical' ? 'Fysisk' : 'Nettbasert'}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm text-stone-700">
              <p>
                <span className="font-semibold text-stone-900">Plasser:</span>{' '}
                {course.hasCapacityLimit ? course.capacityLimit : 'Ingen begrensning'}
              </p>
              <p>
                <span className="font-semibold text-stone-900">Tid:</span> {formatStartAt(course.startAt)}
              </p>
              {course.deliveryMode === 'physical' && (
                <p>
                  <span className="font-semibold text-stone-900">Sted:</span>{' '}
                  {course.locationText || 'Ikke satt'}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-200 pt-5">
              {!isPublished && (
                <button
                  type="button"
                  onClick={() => onPublish(course)}
                  className="rounded-full bg-[#6f7c63] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#617255]"
                >
                  Publiser
                </button>
              )}

              <button
                type="button"
                onClick={() => onEdit(course)}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Rediger
              </button>

              <button
                type="button"
                onClick={() => onDelete(course)}
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Slett
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default AdminCourseList