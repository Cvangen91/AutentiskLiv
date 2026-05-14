function CourseCards({ enrollments, coursesLoading, coursesErrorMessage, emptyMessage, onOpenCourse }) {
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
    <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {enrollments.map((enrollment) => {
        const course = enrollment.courses
        const product = course?.products
        const isOneToOne = course?.delivery_mode === 'one_to_one'

        return (
          <button
            key={enrollment.id}
            type="button"
            className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white/70 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
            onClick={() => onOpenCourse(course.id)}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#6f7c63]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7c63]">
                {isOneToOne ? '1:1 time' : 'Kurs'}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Påmeldt
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-stone-900">{product?.title}</h3>
            <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">{product?.description}</p>

            <div className="mt-6 flex justify-end border-t border-stone-200 pt-5">
              <span className="rounded-full bg-[#6f7c63] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[#617255]">
                Åpne kurs
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function MyCoursesSection({
  regularCourses,
  oneToOneCourses,
  coursesLoading,
  coursesErrorMessage,
  onOpenCourse,
}) {
  return (
    <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Kurs</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Mine kurs</h2>
        </div>
      </div>

      <CourseCards
        enrollments={regularCourses}
        coursesLoading={coursesLoading}
        coursesErrorMessage={coursesErrorMessage}
        emptyMessage="Du er ikke meldt på noen online- eller fysiske kurs enda."
        onOpenCourse={onOpenCourse}
      />

      <div className="mt-10 border-t border-stone-200 pt-8">
        <h3 className="text-xl font-semibold text-stone-900">Mine 1:1 timer</h3>


        <CourseCards
          enrollments={oneToOneCourses}
          coursesLoading={coursesLoading}
          coursesErrorMessage={coursesErrorMessage}
          emptyMessage="Du har ingen 1:1 timer enda."
          onOpenCourse={onOpenCourse}
        />
      </div>
    </section>
  )
}

export default MyCoursesSection
