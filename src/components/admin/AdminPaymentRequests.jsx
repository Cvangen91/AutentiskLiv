import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'

function formatDate(isoString) {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminPaymentRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const statusLabels = {
    pending: 'Venter',
    invoice_sent: 'Faktura sendt',
    paid: 'Betalt',
  }

  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    invoice_sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-gray-100 text-gray-800',
  }

  const fetchPaymentRequests = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('payment_requests')
      .select(`
        id,
        order_id,
        user_id,
        payment_method,
        status,
        billing_name,
        billing_email,
        billing_phone,
        billing_address_line1,
        billing_postal_code,
        billing_city,
        billing_company,
        notes,
        created_at,
        orders (
          total_amount_nok,
          order_items (
            product_id,
            quantity,
            unit_price_nok
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
      setRequests([])
    } else {
      setRequests(data || [])
    }

    if ((!data || (Array.isArray(data) && data.length === 0)) && !fetchError) {
      const { data: simpleData, error: simpleError } = await supabase.from('payment_requests').select('*').order('created_at', { ascending: false })
      if (!simpleError) {
        setRequests(simpleData || [])
      }
    }

    setLoading(false)
  }, [filter])

  useEffect(() => {
    queueMicrotask(() => {
      fetchPaymentRequests()
    })
  }, [fetchPaymentRequests])

  async function createEnrollmentForPaidRequest(req) {
    const productId = req.orders?.order_items?.[0]?.product_id

    if (!productId) {
      throw new Error('Fant ikke produkt på ordren.')
    }

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('product_id', productId)
      .maybeSingle()

    if (courseError) {
      throw new Error(`Feil ved henting av kurs: ${courseError.message}`)
    }

    if (!course) {
      throw new Error('Fant ikke tilhørende kurs for ordren.')
    }

    const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', req.user_id)
      .eq('course_id', course.id)
      .maybeSingle()

    if (enrollmentCheckError) {
      throw new Error(`Feil ved sjekk av påmelding: ${enrollmentCheckError.message}`)
    }

    if (!existingEnrollment) {
      const { error: enrollmentInsertError } = await supabase.from('enrollments').insert({
        user_id: req.user_id,
        course_id: course.id,
        status: 'active',
      })

      if (enrollmentInsertError) {
        throw new Error(`Feil ved opprettelse av påmelding: ${enrollmentInsertError.message}`)
      }
    }

    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', req.order_id)

    if (orderUpdateError) {
      throw new Error(`Feil ved oppdatering av ordrestatus: ${orderUpdateError.message}`)
    }
  }

  async function updateStatus(req, newStatus) {
    if (newStatus === 'paid') {
      await createEnrollmentForPaidRequest(req)
    }

    const { error } = await supabase
      .from('payment_requests')
      .update({ status: newStatus })
      .eq('id', req.id)

    if (error) {
      alert(`Feil ved oppdatering: ${error.message}`)
      return
    }

    await fetchPaymentRequests()
  }

  if (loading) {
    return <div className="text-stone-600">Laster betalingsforespørsler...</div>
  }

  if (error) {
    return <div className="text-red-600">Feil: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'invoice_sent', 'paid'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === status
                ? 'bg-[#6f7c63] text-white'
                : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {status === 'pending' && 'Venter'}
            {status === 'invoice_sent' && 'Faktura sendt'}
            {status === 'paid' && 'Betalt'}
            {status === 'all' && 'Alle'}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg bg-stone-50 p-6 text-center text-stone-600">Ingen betalingsforespørsler</div>
      ) : (
        <div className="space-y-3 overflow-x-auto">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-lg border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-900">{req.billing_name}</h4>
                  <p className="text-sm text-stone-600">{req.billing_email}</p>
                  <p className="text-sm text-stone-600">{req.billing_address_line1}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="inline-block rounded-full bg-stone-200 px-2 py-1 text-xs font-medium text-stone-700">
                      {req.payment_method === 'invoice' ? 'Faktura' : 'Vipps'}
                    </span>
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusClasses[req.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[req.status] || req.status}
                    </span>
                    <span className="font-semibold text-stone-900">
                      {req.orders?.total_amount_nok} NOK
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  className="text-sm font-medium text-[#6f7c63] hover:underline"
                >
                  {expandedId === req.id ? 'Lukk' : 'Detaljer'}
                </button>
              </div>

              {expandedId === req.id && (
                <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Kontaktinformasjon</p>
                    <p className="text-sm text-stone-600">{req.billing_phone}</p>
                    {req.billing_company && (
                      <p className="text-sm text-stone-600">{req.billing_company}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-stone-700">Adresse</p>
                    <p className="text-sm text-stone-600">
                      {req.billing_address_line1}
                      {req.billing_address_line2 && `, ${req.billing_address_line2}`}
                    </p>
                    <p className="text-sm text-stone-600">
                      {req.billing_postal_code} {req.billing_city}
                    </p>
                  </div>

                  {req.notes && (
                    <div>
                      <p className="text-sm font-medium text-stone-700">Notater</p>
                      <p className="text-sm text-stone-600">{req.notes}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-stone-700">Opprettet</p>
                    <p className="text-sm text-stone-600">{formatDate(req.created_at)}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {req.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(req, 'invoice_sent')}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Markér faktura sendt
                      </button>
                    )}
                    {req.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(req, 'paid')}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        Markér betalt
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
