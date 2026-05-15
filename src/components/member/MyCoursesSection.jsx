function formatCourseDate(enrollment) {
  const course = enrollment?.courses
  const isOneToOne = course?.delivery_mode === 'one_to_one'

  // For 1:1 bookings from orders
  if (enrollment?.order_items) {
    const paymentRequest = enrollment?.payment_requests?.[0]
    if (paymentRequest?.notes) {
      const timeMatch = paymentRequest.notes.match(/Valgt tid: (.+?)(\n|$)/)
      if (timeMatch) {
        return timeMatch[1]
      }
    }
    return 'Tid ikke satt'
  }

  // For 1:1 bookings from enrollments
  if (isOneToOne) {
    const orderData = enrollment?._orderData
    if (orderData?.payment_requests?.[0]?.notes) {
      const timeMatch = orderData.payment_requests[0].notes.match(/Valgt tid: (.+?)(\n|$)/)
      if (timeMatch) {
        return timeMatch[1]
      }
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

function CourseList({ enrollments, coursesLoading, coursesErrorMessage, emptyMessage, onOpenCourse }) {
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
            // Handle both enrollment objects and order objects
            const isOrder = enrollment?.order_items ? true : false
            const product = isOrder 
              ? enrollment.order_items?.[0]?.products 
              : enrollment.courses?.products
            const course = isOrder 
              ? enrollment.order_items?.[0]?.products?.courses 
              : enrollment.courses
            const courseId = course?.id

            if (!product) return null

            // For orders, use orderId as key; for enrollments, use enrollmentId
            const key = isOrder ? `order-${enrollment.id}` : `enrollment-${enrollment.id}`

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
                    <button
                      type="button"
                      onClick={() => courseId && onOpenCourse(courseId)}
                      className="rounded-lg bg-[#6f7c63] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                      disabled={!courseId}
                    >
                      Se mer
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

function MyCoursesSection({
  regularCourses,
  oneToOneCourses,
  oneToOneBookings = [],
  coursesLoading,
  oneToOneLoading,
  coursesErrorMessage,
  oneToOneErrorMessage,
  onOpenCourse,
}) {
  // Combine 1:1 enrollments and pending bookings
  const allOneToOneItems = [...oneToOneCourses, ...oneToOneBookings]

  return (
    <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Kurs</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Mine kurs</h2>
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
        <h3 className="text-xl font-semibold text-stone-900">Mine 1:1 timer</h3>

        <CourseList
          enrollments={allOneToOneItems}
          coursesLoading={coursesLoading || oneToOneLoading}
          coursesErrorMessage={coursesErrorMessage || oneToOneErrorMessage}
          emptyMessage="Du har ingen 1:1 timer enda."
          onOpenCourse={onOpenCourse}
        />
      </div>
    </section>
  )
}

export default MyCoursesSection

