import { useState } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'

function Admin() {
  const { user } = useAuth()
  const { role } = useRole()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [priceNok, setPriceNok] = useState('')
  const [status, setStatus] = useState('draft')

  const [introText, setIntroText] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState('')
  const [isSelfPaced, setIsSelfPaced] = useState(true)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    await logout()
  }

  async function handleCreateProduct(e) {
    e.preventDefault()
    setMessage('')

    if (!user) {
      setMessage('Ingen innlogget bruker funnet.')
      return
    }

    setLoading(true)

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        title,
        slug,
        description,
        product_type: 'course',
        price_nok: Number(priceNok),
        status,
        created_by: user.id,
      })
      .select()
      .single()

    if (productError) {
      setMessage(`Feil ved lagring av produkt: ${productError.message}`)
      setLoading(false)
      return
    }

    const { error: courseError } = await supabase
      .from('courses')
      .insert({
        product_id: product.id,
        intro_text: introText,
        difficulty_level: difficultyLevel || null,
        is_self_paced: isSelfPaced,
      })

    if (courseError) {
      setMessage(`Produkt lagret, men feil ved lagring av kurs: ${courseError.message}`)
      setLoading(false)
      return
    }

    setMessage('Produkt og kurs lagret!')
    setTitle('')
    setSlug('')
    setDescription('')
    setPriceNok('')
    setStatus('draft')
    setIntroText('')
    setDifficultyLevel('')
    setIsSelfPaced(true)
    setLoading(false)
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

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">
                Kurs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                Opprett kurs
              </h2>
            </div>
          </div>

          <form onSubmit={handleCreateProduct} className="mt-6 grid gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-semibold text-stone-700">
                  Tittel
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  value={priceNok}
                  onChange={(e) => setPriceNok(e.target.value)}
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
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
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
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  placeholder="f.eks. beginner"
                  className="w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-[#6f7c63] focus:ring-4 focus:ring-[#6f7c63]/15"
                />
                <label className="mt-3 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isSelfPaced}
                    onChange={(e) => setIsSelfPaced(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-[#6f7c63] focus:ring-[#6f7c63]"
                  />
                  Selvstudium
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#6f7c63] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Lagrer...' : 'Lagre kurs'}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
        </section>
      </div>
    </div>
  )
}

export default Admin