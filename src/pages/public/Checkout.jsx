import { useEffect, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useAuth } from '../../features/auth/useAuth'
import { createOrderAndPaymentRequest } from '../../features/orders/orderService'
import defaultCourseImage from '../../constants/defaultCourseImage'

function formatCourseDate(value) {
  if (!value) return 'Fast/løpende kurs'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Ugyldig dato'

  return date.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatTimeSlotRange(startValue, endValue) {
  if (!startValue || !endValue) {
    return 'Ukjent tid'
  }

  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Ugyldig tid'
  }

  return `${start.toLocaleString('nb-NO', { dateStyle: 'medium', timeStyle: 'short' })} - ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`
}

export default function Checkout() {
  const { productId } = useParams()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const selectedTimeSlotId = new URLSearchParams(location.search).get('slotId')

  const [product, setProduct] = useState(null)
  const [course, setCourse] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [timeSlotLoading, setTimeSlotLoading] = useState(false)

  const [billingData, setBillingData] = useState({
    billing_name: '',
    billing_email: user?.email || '',
    billing_phone: '',
    billing_company: '',
    billing_org_number: '',
    billing_address_line1: '',
    billing_address_line2: '',
    billing_postal_code: '',
    billing_city: '',
    billing_country: 'Norge',
    notes: '',
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login')
      return
    }

    async function fetchProduct() {
      setLoading(true)
      setErrorMessage('')

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price_nok,
          cover_image_url,
          product_type,
          status,
          courses (
            id,
            has_capacity_limit,
            capacity_limit,
            delivery_mode,
            start_at,
            location_text
          )
        `)
        .eq('id', productId)
        .single()

      if (productError) {
        setErrorMessage(`Fant ikke kurs: ${productError.message}`)
        setLoading(false)
        return
      }

      setProduct(productData)

      // Supabase may return a single object for the related `courses` when there's only one
      const courses = productData?.courses
        ? Array.isArray(productData.courses)
          ? productData.courses
          : [productData.courses]
        : []

      if (courses && courses.length > 0) {
        const selectedCourse = courses[0]
        setCourse(selectedCourse)

        if (selectedCourse.delivery_mode === 'one_to_one' && !selectedTimeSlotId) {
          setErrorMessage('Du må velge en ledig tid før du går videre til betaling.')
          setLoading(false)
          return
        }
      } else {
        setErrorMessage('Beklager en feil oppstod. Kontakt admin.')
        setLoading(false)
        return
      }
      setLoading(false)
    }

    fetchProduct()
  }, [user, productId, navigate, selectedTimeSlotId])

  useEffect(() => {
    if (!user) return

    async function fetchProfileData() {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, zipcode, city')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        return
      }

      const metadata = user.user_metadata || {}
      const resolvedFirstName = profileData?.first_name || metadata.first_name || ''
      const resolvedLastName = profileData?.last_name || metadata.last_name || ''
      const resolvedName = `${resolvedFirstName} ${resolvedLastName}`.trim()

      setBillingData((prev) => ({
        ...prev,
        billing_name: resolvedName || prev.billing_name,
        billing_email: user.email || prev.billing_email,
        billing_phone: profileData?.phone || metadata.phone || prev.billing_phone,
        billing_address_line1: profileData?.address || metadata.address || prev.billing_address_line1,
        billing_postal_code: profileData?.zipcode || metadata.zipcode || prev.billing_postal_code,
        billing_city: profileData?.city || metadata.city || prev.billing_city,
      }))
    }

    fetchProfileData()
  }, [user])

  useEffect(() => {
    if (!course || course.delivery_mode !== 'one_to_one') {
      setSelectedTimeSlot(null)
      setTimeSlotLoading(false)
      return
    }

    if (!selectedTimeSlotId) {
      setSelectedTimeSlot(null)
      return
    }

    let isActive = true

    async function fetchSelectedTimeSlot() {
      setTimeSlotLoading(true)

      const { data, error } = await supabase
        .from('time_slots')
        .select('id, start_time, end_time, status, notes')
        .eq('id', selectedTimeSlotId)
        .maybeSingle()

      if (!isActive) {
        return
      }

      if (error) {
        setErrorMessage(`Fant ikke valgt tid: ${error.message}`)
        setSelectedTimeSlot(null)
        setTimeSlotLoading(false)
        return
      }

      if (!data || data.status !== 'available') {
        setErrorMessage('Den valgte tiden er ikke lenger ledig. Velg en annen tid.')
        setSelectedTimeSlot(null)
        setTimeSlotLoading(false)
        return
      }

      setSelectedTimeSlot(data)
      setTimeSlotLoading(false)
    }

    fetchSelectedTimeSlot()
    return () => {
      isActive = false
    }
  }, [course, selectedTimeSlotId])

  function handleBillingChange(e) {
    const { name, value } = e.target
    setBillingData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleInvoiceSubmit() {
    if (!product) {
      alert('Feil: Produktinformasjon mangler')
      return
    }

    if (!course) {
      alert('Feil: Kursinformasjon mangler. Kontakt admin.')
      return
    }

    if (course.delivery_mode === 'one_to_one' && !selectedTimeSlot) {
      alert('Du må velge en ledig tid før du kan sende betalingsforespørselen.')
      return
    }

    if (!billingData.billing_name || !billingData.billing_address_line1 || !billingData.billing_postal_code || !billingData.billing_city) {
      alert('Vennligst fyll inn alle obligatoriske felter')
      return
    }

    setSubmitting(true)

    try {
      await createOrderAndPaymentRequest(
        user.id,
        product.id,
        course.id,
        product.price_nok,
        'invoice',
        billingData,
        selectedTimeSlot
      )

      alert('Din bestilling er gjennomført. Du vil motta en faktura på e-post eller via vipps snart.')
      navigate('/profile')
    } catch (error) {
      alert(error?.message || 'Beklager, det skjedde en feil. Prøv igjen senere eller ta kontakt med admin.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleVippsSubmit() {
    alert('Vipps-betaling kommer snart!')
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pt-28 text-center text-stone-700 sm:px-6 lg:px-8">
        Laster betalingsopplysninger...
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pt-28 text-center text-stone-700 sm:px-6 lg:px-8">
        Feil: {errorMessage}
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pt-28 text-center text-stone-700 sm:px-6 lg:px-8">
        Fant ikke kurset
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-24 text-stone-900 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white/65 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Betaling for kurs</h1>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px] sm:mt-6 sm:gap-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{product.title}</h2>
              <p className="mt-2 text-sm text-stone-600">{product.description}</p>

              <div className="mt-4 space-y-2 text-sm text-stone-700">
                {course?.start_at && (
                  <p>
                    <span className="font-medium">Tid:</span> {formatCourseDate(course.start_at)}
                  </p>
                )}
                {course?.delivery_mode === 'physical' && course?.location_text && (
                  <p>
                    <span className="font-medium">Sted:</span> {course.location_text}
                  </p>
                )}
                {course?.delivery_mode === 'one_to_one' && (
                  <p>
                    <span className="font-medium">Valgt tid:</span>{' '}
                    {timeSlotLoading
                      ? 'Laster valgt tid...'
                      : selectedTimeSlot
                        ? formatTimeSlotRange(selectedTimeSlot.start_time, selectedTimeSlot.end_time)
                        : 'Ingen valgt tid'}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4">
              <div className="overflow-hidden rounded-lg bg-stone-100">
                <img
                  src={product.cover_image_url || defaultCourseImage}
                  alt={product.title}
                  className="h-40 w-full object-cover"
                />
              </div>
              <div className="mt-4 border-t border-stone-200 pt-4">
                <dt className="text-sm font-medium text-stone-500">Totalt</dt>
                <dd className="mt-1 text-2xl font-semibold text-stone-900">{product.price_nok} NOK</dd>
              </div>
            </div>
          </div>
        </section>

        {!selectedPaymentMethod ? (
          <section className="rounded-[2rem] border border-stone-200 bg-white/65 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
            <h3 className="text-lg font-semibold text-stone-900">Velg betalingsmåte</h3>

            <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-2xl border-2 border-[#6f7c63] bg-white p-5 text-left transition hover:bg-[#f5f3f0] sm:p-6"
                onClick={() => setSelectedPaymentMethod('invoice')}
              >
                <h4 className="font-semibold text-stone-900">Faktura</h4>
                <p className="mt-1 text-sm text-stone-600">
                  Vi sender faktura via e-post eller Vipps.
                </p>
              </button>

              <button
                type="button"
                disabled
                className="rounded-2xl border-2 border-stone-300 bg-stone-50 p-5 text-left opacity-50 sm:p-6"
              >
                <h4 className="font-semibold text-stone-600">Vipps</h4>
                <p className="mt-1 text-sm text-stone-500">Kommer snart</p>
              </button>
            </div>
          </section>
        ) : null}

        {selectedPaymentMethod === 'invoice' && (
          <section className="rounded-[2rem] border border-stone-200 bg-white/65 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
            <h3 className="text-lg font-semibold text-stone-900">Faktureringsopplysninger</h3>

            <div className="mt-5 space-y-4 sm:mt-6">
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Fullt navn *
                </label>
                <input
                  type="text"
                  name="billing_name"
                  value={billingData.billing_name}
                  onChange={handleBillingChange}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                  placeholder="Ditt fulle navn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  E-post *
                </label>
                <input
                  type="email"
                  name="billing_email"
                  value={billingData.billing_email}
                  onChange={handleBillingChange}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="billing_phone"
                  value={billingData.billing_phone}
                  onChange={handleBillingChange}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                  placeholder="Ditt telefonnummer"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Bedrift/Organisasjon
                  </label>
                  <input
                    type="text"
                    name="billing_company"
                    value={billingData.billing_company}
                    onChange={handleBillingChange}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                    placeholder="Valgfritt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Organisasjonsnummer
                  </label>
                  <input
                    type="text"
                    name="billing_org_number"
                    value={billingData.billing_org_number}
                    onChange={handleBillingChange}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                    placeholder="Valgfritt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="billing_address_line1"
                  value={billingData.billing_address_line1}
                  onChange={handleBillingChange}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                  placeholder="Gatenavn og husnummer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Adresse (linje 2)
                </label>
                <input
                  type="text"
                  name="billing_address_line2"
                  value={billingData.billing_address_line2}
                  onChange={handleBillingChange}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                  placeholder="Bygning, leilighet, etc."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Postnummer *
                  </label>
                  <input
                    type="text"
                    name="billing_postal_code"
                    value={billingData.billing_postal_code}
                    onChange={handleBillingChange}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                    placeholder="f.eks. 0150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    By *
                  </label>
                  <input
                    type="text"
                    name="billing_city"
                    value={billingData.billing_city}
                    onChange={handleBillingChange}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                    placeholder="By"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Land
                </label>
                <input
                  type="text"
                  name="billing_country"
                  value={billingData.billing_country}
                  onChange={handleBillingChange}
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Notater
                </label>
                <textarea
                  name="notes"
                  value={billingData.notes}
                  onChange={handleBillingChange}
                  rows="3"
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 placeholder-stone-400 focus:border-[#6f7c63] focus:outline-none"
                  placeholder="Eventuelle spesielle ønsker eller behov"
                />
              </div>
            </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-2xl bg-[#6f7c63] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#617255] disabled:opacity-50"
                onClick={handleInvoiceSubmit}
                disabled={submitting}
              >
                {submitting ? 'Sender...' : 'Send betalingsforespørsel'}
              </button>

              <button
                type="button"
                className="rounded-2xl border border-stone-200 px-6 py-3.5 font-semibold text-stone-700 transition hover:bg-stone-50"
                onClick={() => setSelectedPaymentMethod(null)}
                disabled={submitting}
              >
                Tilbake
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
