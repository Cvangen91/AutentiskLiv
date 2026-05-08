import { useEffect, useState } from 'react'
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
  const [filter, setFilter] = useState('pending')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchPaymentRequests()
  }, [filter])

  async function fetchPaymentRequests() {
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

    setLoading(false)
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('payment_requests')
      .update({ status: newStatus })
      .eq('id', id)

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
        {['pending', 'sent_to_anne', 'approved', 'paid', 'all'].map((status) => (
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
            {status === 'sent_to_anne' && 'Sendt til Anne'}
            {status === 'approved' && 'Godkjent'}
            {status === 'paid' && 'Betalt'}
            {status === 'all' && 'Alle'}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg bg-stone-50 p-6 text-center text-stone-600">
          Ingen betalingsforespørsler
        </div>
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
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'sent_to_anne' ? 'bg-blue-100 text-blue-800' :
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status === 'pending' && 'Venter'}
                      {req.status === 'sent_to_anne' && 'Sendt'}
                      {req.status === 'approved' && 'Godkjent'}
                      {req.status === 'paid' && 'Betalt'}
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
                    {req.status !== 'sent_to_anne' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'sent_to_anne')}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Markér sendt
                      </button>
                    )}
                    {req.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'approved')}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Godkjenn
                      </button>
                    )}
                    {req.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(req.id, 'paid')}
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
