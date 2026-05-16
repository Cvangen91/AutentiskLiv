import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'

function mapPaymentLabel(status) {
  if (!status) return 'Ukjent'
  if (status === 'paid') return 'Betalt'
  if (status === 'pending') return 'Venter'
  if (status === 'invoice_sent') return 'Faktura sendt'
  return status
}

export default function AdminCourseAttendeesModal({ courseId, title, onClose }) {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function fetchAttendees() {
      setLoading(true)
      setError('')

      // Get product_id for course so we can look up orders
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('id, product_id')
        .eq('id', courseId)
        .maybeSingle()

      if (courseErr) {
        if (isActive) {
          setError(courseErr.message)
          setLoading(false)
        }
        return
      }

      const productId = courseData?.product_id || null

      // Fetch enrollments with profile info
      const { data: enrollments, error: enrollErr } = await supabase
        .from('enrollments')
        .select('id, user_id, status, profiles (first_name, last_name, email)')
        .eq('course_id', courseId)
        .order('id', { ascending: false })

      if (!isActive) return

      if (enrollErr) {
        setError(enrollErr.message)
        setAttendees([])
        setLoading(false)
        return
      }

      const list = enrollments || []

      // If we have a productId and any enrollments, fetch orders for those users
      let paymentMap = {}

      if (productId && list.length > 0) {
        const userIds = Array.from(new Set(list.map((e) => e.user_id).filter(Boolean)))

        if (userIds.length > 0) {
          const { data: ordersData, error: ordersErr } = await supabase
            .from('orders')
            .select('id, user_id, payment_status, created_at, order_items (product_id)')
            .in('user_id', userIds)
            .eq('order_items.product_id', productId)
            .order('created_at', { ascending: false })

          if (!ordersErr && ordersData && ordersData.length > 0) {
            // Map latest payment_status per user
            for (const ord of ordersData) {
              if (!paymentMap[ord.user_id]) {
                paymentMap[ord.user_id] = ord.payment_status || null
              }
            }
          }
        }
      }

      // Combine enrollments with payment status and profile
      const attendeesWithPayment = list.map((e) => {
        const profile = e.profiles || e.profile || null
        return {
          id: e.id,
          user_id: e.user_id,
          status: e.status,
          profile,
          payment_status: paymentMap[e.user_id] || null,
        }
      })

      setAttendees(attendeesWithPayment)
      setLoading(false)
    }

    fetchAttendees()

    return () => {
      isActive = false
    }
  }, [courseId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Påmeldte: {title}</h3>
          <button onClick={onClose} className="text-stone-600">Lukk</button>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-stone-600">Laster påmeldte...</p>
          ) : error ? (
            <p className="text-red-600">Feil: {error}</p>
          ) : attendees.length === 0 ? (
            <p className="text-stone-600">Ingen påmeldte funnet.</p>
          ) : (
            <ul className="space-y-2">
              {attendees.map((a) => {
                const profile = a.profile || null
                const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''

                return (
                  <li key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-stone-900">{name || a.user_id}</p>
                      {profile?.email && <p className="text-sm text-stone-600">{profile.email}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-stone-600">{mapPaymentLabel(a.payment_status)}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
