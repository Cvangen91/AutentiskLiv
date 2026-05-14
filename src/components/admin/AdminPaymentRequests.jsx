import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'

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
    pending: 'status-yellow',
    invoice_sent: 'status-lavendel',
    paid: 'status-green',
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

  async function markInvoiceSent(req) {
    const { error } = await supabase
      .from('payment_requests')
      .update({ status: 'invoice_sent' })
      .eq('id', req.id)

    if (error) {
      alert(`Feil ved oppdatering: ${error.message}`)
      return
    }

    await fetchPaymentRequests()
  }

  async function deleteRequest(reqId) {
    if (!confirm('Slett betalingsforespørselen? Dette kan ikke angres.')) return

    const { error } = await supabase
      .from('payment_requests')
      .delete()
      .eq('id', reqId)

    if (error) {
      alert(`Feil ved sletting: ${error.message}`)
      return
    }

    await fetchPaymentRequests()
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-300 bg-stone-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900">Navn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900">E-post</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900">Sum</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900">Handlinger</th>
              </tr>
            </thead>
            <tbody>
          {requests.map((req) => (
            <>
              <tr
                key={req.id}
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="border-b border-stone-200 hover:bg-stone-50 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-stone-900">{req.billing_name}</td>
                <td className="px-4 py-3 text-sm text-stone-600">{req.billing_email}</td>
                <td className="px-4 py-3 text-sm font-medium text-stone-900">{req.orders?.total_amount_nok} NOK</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusClasses[req.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[req.status] || req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {req.status === 'pending' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); markInvoiceSent(req) }}
                        className="rounded-lg btn-lavendel px-3 py-1.5 text-xs font-medium"
                      >
                        Faktura sendt
                      </button>
                    )}
                    {req.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateStatus(req, 'paid') }}
                        className="rounded-lg btn-green px-3 py-1.5 text-xs font-medium"
                      >
                        Markér betalt
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteRequest(req.id) }}
                      className="rounded-lg btn-red px-3 py-1.5 text-xs font-medium"
                    >
                      Slett
                    </button>
                  </div>
                </td>
              </tr>

              {expandedId === req.id && (
                <tr key={`${req.id}-details`} className="bg-white">
                  <td colSpan={5} className="px-4 py-3 text-sm text-stone-700">
                    <div className="space-y-1">
                      <div><span className="font-medium">Telefon:</span> {req.billing_phone || '-'}</div>
                      <div>
                        <span className="font-medium">Adresse:</span> {req.billing_address_line1 || '-'}{req.billing_address_line2 ? `, ${req.billing_address_line2}` : ''} {req.billing_postal_code || ''} {req.billing_city || ''}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
