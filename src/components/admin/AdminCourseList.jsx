function AdminCourseList({ courses, loading, error, onEdit, onDelete, onPublish }) {
  function formatDeliveryMode(value) {
    if (value === 'physical') {
      return 'Fysisk'
    }

    if (value === 'one_to_one') {
      return '1:1 booking'
    }

    return 'Nettbasert'
  }

  function formatStatus(value) {
    if (value === 'published') {
      return 'Publisert'
    }

    if (value === 'archived') {
      return 'Arkivert'
    }

    return 'Utkast'
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
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Tittel</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Type kurs</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Status</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-stone-900">Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const isPublished = course.status === 'published'

            return (
              <tr key={course.id} className="border-b border-stone-200 transition hover:bg-stone-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-stone-900">{course.title}</p>
                </td>
                <td className="px-6 py-4 text-stone-700">
                  {formatDeliveryMode(course.deliveryMode)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                    {formatStatus(course.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(course)}
                      className="rounded-lg btn-lavendel px-3 py-2 text-sm font-medium transition"
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(course)}
                      className="rounded-lg btn-red px-3 py-2 text-sm font-medium transition"
                    >
                      Slett
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AdminCourseList