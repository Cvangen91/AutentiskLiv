import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'

function Profile() {
  const { user } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()

  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogout() {
    await logout()
  }

  useEffect(() => {
    async function fetchMyCourses() {
      if (!user) return

      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          courses (
            id,
            product_id,
            products (
              id,
              title,
              description,
              cover_image_url
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        setErrorMessage(error.message)
      } else {
        setMyCourses(data || [])
      }

      setLoading(false)
    }

    fetchMyCourses()
  }, [user])

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
            Profil
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Min profil
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                Her får du oversikt over innloggingen din, rollen din og kursene du er meldt på.
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255]"
            >
              Logg ut
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
                Kurs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                Mine kurs
              </h2>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-stone-700">Laster kurs...</p>
          ) : errorMessage ? (
            <p className="mt-6 text-stone-700">Feil: {errorMessage}</p>
          ) : myCourses.length === 0 ? (
            <p className="mt-6 text-stone-700">
              Du er ikke meldt på noen kurs enda.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {myCourses.map((enrollment) => {
                const course = enrollment.courses
                const product = course?.products

                return (
                  <button
                    key={enrollment.id}
                    type="button"
                    className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white/70 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
                    onClick={() => navigate(`/my-courses/${course.id}`)}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#6f7c63]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7c63]">
                        Kurs
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        Påmeldt
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold text-stone-900">
                      {product?.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-base leading-7 text-stone-700">
                      {product?.description}
                    </p>

                    <div className="mt-6 flex justify-end border-t border-stone-200 pt-5">
                      <span className="rounded-full bg-[#6f7c63] px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-[#617255]">
                        Åpne kurs
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Profile