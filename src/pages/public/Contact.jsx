import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData])

      if (error) {
        throw error
      }

      setSubmitStatus({
        type: 'success',
        message: 'Takk for din melding! Vi kontakter deg så snart som mulig.'
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Noe gikk galt. Prøv igjen senere.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-24 text-stone-900 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2.5rem] border border-stone-200 bg-white/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Ta kontakt
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700 sm:mt-5 sm:text-lg sm:leading-8">
              Har du spørsmål eller vil du vite mer om coaching og healing? 
              Fyll ut skjemaet under, så tar vi kontakt med deg så snart som mulig.
            </p>
          </div>

          {submitStatus && (
            <div className={`mb-6 rounded-lg p-4 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-900">
                  Navn *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-500 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  placeholder="Ditt navn"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-900">
                  E-post *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-500 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  placeholder="din@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-900">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-500 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                placeholder="+47 XXX XX XXX"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-stone-900">
                Emne *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-500 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                placeholder="Hva handler meldingen din om?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-stone-900">
                Melding *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-500 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                placeholder="Skriv din melding her..."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-stone-900 px-6 py-3.5 font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Sender...' : 'Send melding'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            * Påkrevd felt
          </p>
        </section>
      </div>
    </div>
  )
}

export default Contact
