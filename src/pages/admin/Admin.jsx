import { useState } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { useRole } from '../../hooks/useRole'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'
import './Admin.css'

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
    <div className="admin-page">
      <h1 className="admin-page__title">Admin</h1>

      <div className="admin-page__info">
        <p>Innlogget som: {user?.email}</p>
        <p>Rolle: {role}</p>
      </div>

      <button
        onClick={handleLogout}
        className="admin-page__logout-button"
      >
        Logg ut
      </button>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Opprett kurs</h2>

        <form onSubmit={handleCreateProduct} className="admin-form">
          <div className="admin-form__field">
            <label htmlFor="title" className="admin-form__label">
              Tittel
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="admin-form__input"
            />
          </div>

          <div className="admin-form__field">
            <label htmlFor="slug" className="admin-form__label">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="admin-form__input"
            />
          </div>

          <div className="admin-form__field">
            <label htmlFor="description" className="admin-form__label">
              Beskrivelse
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="admin-form__textarea"
            />
          </div>

          <div className="admin-form__field">
            <label htmlFor="priceNok" className="admin-form__label">
              Pris (NOK)
            </label>
            <input
              id="priceNok"
              type="number"
              value={priceNok}
              onChange={(e) => setPriceNok(e.target.value)}
              required
              min="0"
              className="admin-form__input"
            />
          </div>

          <div className="admin-form__field">
            <label htmlFor="status" className="admin-form__label">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="admin-form__select"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>

          <div className="admin-form__divider" />

          <div className="admin-form__field">
            <label htmlFor="introText" className="admin-form__label">
              Introtekst
            </label>
            <textarea
              id="introText"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={3}
              className="admin-form__textarea"
            />
          </div>

          <div className="admin-form__field">
            <label htmlFor="difficultyLevel" className="admin-form__label">
              Vanskelighetsgrad
            </label>
            <input
              id="difficultyLevel"
              type="text"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              placeholder="f.eks. beginner"
              className="admin-form__input"
            />
          </div>

          <label className="admin-form__checkbox-label">
            <input
              type="checkbox"
              checked={isSelfPaced}
              onChange={(e) => setIsSelfPaced(e.target.checked)}
            />
            <span>Selvstudium</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="admin-form__submit"
          >
            {loading ? 'Lagrer...' : 'Lagre kurs'}
          </button>
        </form>

        {message && <p className="admin-page__message">{message}</p>}
      </section>
    </div>
  )
}

export default Admin