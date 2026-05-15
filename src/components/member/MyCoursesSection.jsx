function formatCourseDate(enrollment) {
  const course = enrollment?.products?.courses || enrollment?.courses
  const isOneToOne = course?.delivery_mode === 'one_to_one'

  if (enrollment?.start_time && enrollment?.end_time) {
    const start = new Date(enrollment.start_time)
    const end = new Date(enrollment.end_time)

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return `${start.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })} - ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  const timeSlot = Array.isArray(enrollment?.time_slots)
    ? enrollment.time_slots[0]
    : enrollment?.time_slots

  if (timeSlot?.start_time && timeSlot?.end_time) {
    const start = new Date(timeSlot.start_time)
    const end = new Date(timeSlot.end_time)

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return `${start.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })} - ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  if (isOneToOne) {
    if (timeSlot?.start_time) {
      return new Date(timeSlot.start_time).toLocaleString('nb-NO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    }

    return 'Tid ikke satt'
  }

  // For regular courses
  const courseDate = course?.products?.start_at
  if (!courseDate) {
    return 'Fast/løpende kurs'
  }

  const date = new Date(courseDate)
  return Number.isNaN(date.getTime())
    ? 'Ugyldig dato'
    : date.toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })
}

function CourseList({ enrollments, coursesLoading, coursesErrorMessage, emptyMessage, onOpenCourse, onCancelBooking }) {
  if (coursesLoading) {
    return <p className="mt-6 text-stone-700">Laster kurs...</p>
  }

  if (coursesErrorMessage) {
    return <p className="mt-6 text-stone-700">Feil: {coursesErrorMessage}</p>
  }

  if (enrollments.length === 0) {
    return <p className="mt-6 text-stone-700">{emptyMessage}</p>
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Tittel</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Dato</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-stone-900">Handling</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => {
            const isBooking = Boolean(enrollment?.products)
            const product = isBooking ? enrollment.products : enrollment.courses?.products
            const course = isBooking ? enrollment.products?.courses : enrollment.courses
            const courseId = course?.id

            if (!product) return null

            const key = isBooking ? `booking-${enrollment.id}` : `enrollment-${enrollment.id}`

            const isOneToOne = course?.delivery_mode === 'one_to_one'

            return (
              <tr key={key} className="border-b border-stone-200 transition hover:bg-stone-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-stone-900">{product.title}</p>
                </td>
                <td className="px-6 py-4 text-sm text-stone-700">
                  {formatCourseDate(enrollment)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    {isOneToOne ? (
                      <button
                        type="button"
                        onClick={() => onCancelBooking && onCancelBooking(enrollment.id)}
                        className="rounded-lg btn-red px-4 py-2 text-sm font-medium transition hover:opacity-90"
                        disabled={!enrollment.id}
                      >
                        Avbestill
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => courseId && onOpenCourse(courseId)}
                        className="rounded-lg bg-[#6f7c63] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        disabled={!courseId}
                      >
                        Se mer
                      </button>
                    )}
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

function MyCoursesSection({
  regularCourses,
  oneToOneCourses,
  oneToOneBookings = [],
  coursesLoading,
  oneToOneLoading,
  coursesErrorMessage,
  oneToOneErrorMessage,
  onOpenCourse,
  onCancelBooking,
}) {
  // Combine 1:1 enrollments and pending bookings, removing duplicates
  // If a product_id exists in bookings, don't include it from enrollments
  const bookingProductIds = new Set(oneToOneBookings.map((b) => b.product_id))
  const uniqueOneToOneCourses = oneToOneCourses.filter(
    (enrollment) => !bookingProductIds.has(enrollment.courses?.product_id)
  )
  const allOneToOneItems = [...uniqueOneToOneCourses, ...oneToOneBookings]

  return (
    <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Dine kurs</h2>
        </div>
      </div>

      <CourseList
        enrollments={regularCourses}
        coursesLoading={coursesLoading}
        coursesErrorMessage={coursesErrorMessage}
        emptyMessage="Du er ikke meldt på noen online- eller fysiske kurs enda."
        onOpenCourse={onOpenCourse}
      />

      <div className="mt-10 border-t border-stone-200 pt-8">
        <h3 className="text-xl font-semibold text-stone-900">Dine 1:1 timer</h3>

        <CourseList
          enrollments={allOneToOneItems}
          coursesLoading={coursesLoading || oneToOneLoading}
          coursesErrorMessage={coursesErrorMessage || oneToOneErrorMessage}
          emptyMessage="Du har ingen 1:1 timer enda."
          onOpenCourse={onOpenCourse}
          onCancelBooking={onCancelBooking}
        />
      </div>
    </section>
  )
}

export default MyCoursesSection

