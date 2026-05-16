import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { supabase } from '../../lib/supabase/client'

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Ugyldig dato'
    : date.toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })
}

function formatStatus(status) {
  if (status === 'available') return 'Ledig'
  if (status === 'booked') return 'Booket'
  if (status === 'blocked') return 'Blokkert'
  return status || '-'
}

export default function AdminAvailableTimes() {
  const { user } = useAuth()
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSlotId, setEditingSlotId] = useState(null)
  const dateInputRef = useRef(null)

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
  })

  const fetchTimeSlots = useCallback(async () => {
    setLoading(true)
    setError('')

    // include related booking and profile information when available
    const { data, error: fetchError } = await supabase
      .from('time_slots')
      .select(
        `id, start_time, end_time, status, notes, created_at, bookings (id, user_id, booking_status, profiles (first_name, last_name, email))`
      )
      .order('start_time', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setTimeSlots([])
    } else {
      setTimeSlots(data || [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTimeSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function updateStartTime(part, value) {
    const [currentHour = '', currentMinute = ''] = formData.start_time.split(':')
    const nextValue = part === 'hour' ? `${value}:${currentMinute || '00'}` : `${currentHour || '00'}:${value}`

    setFormData((prev) => ({
      ...prev,
      start_time: nextValue,
    }))
  }

  function updateEndTime(part, value) {
    const [currentHour = '', currentMinute = ''] = formData.end_time.split(':')
    const nextValue = part === 'hour' ? `${value}:${currentMinute || '00'}` : `${currentHour || '00'}:${value}`

    setFormData((prev) => ({
      ...prev,
      end_time: nextValue,
    }))
  }

  function handleEdit(slot) {
    const startDate = new Date(slot.start_time)
    const endDate = new Date(slot.end_time)
    const date = startDate.toISOString().split('T')[0]
    const start_time = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
    const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

    setFormData({
      date,
      start_time,
      end_time,
      notes: slot.notes || '',
    })
    setEditingSlotId(slot.id)
    setIsEditing(true)
    setShowForm(true)
    setMessage('')
  }

  function handleCancel() {
    setFormData({
      date: '',
      start_time: '',
      end_time: '',
      notes: '',
    })
    setEditingSlotId(null)
    setIsEditing(false)
    setShowForm(false)
    setMessage('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    if (!formData.date || !formData.start_time || !formData.end_time) {
      setMessage('Vennligst fyll inn dag, starttid og sluttid')
      return
    }

    const [startHour, startMinute] = formData.start_time.split(':')
    const [endHour, endMinute] = formData.end_time.split(':')
    const startTime = new Date(`${formData.date}T${startHour}:${startMinute}:00`)
    const endTime = new Date(`${formData.date}T${endHour}:${endMinute}:00`)

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      setMessage('Ugyldig dato eller tidspunkt')
      return
    }

    if (endTime <= startTime) {
      setMessage('Sluttid må være etter starttid')
      return
    }

    setSubmitting(true)

    if (isEditing && editingSlotId) {
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: formData.notes || null,
        })
        .eq('id', editingSlotId)

      if (updateError) {
        setMessage(`Feil: ${updateError.message}`)
        setSubmitting(false)
        return
      }

      setMessage('Ledig tid oppdatert!')
    } else {
      const { error: insertError } = await supabase.from('time_slots').insert({
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'available',
        notes: formData.notes || null,
        created_by: user.id,
      })

      if (insertError) {
        setMessage(`Feil: ${insertError.message}`)
        setSubmitting(false)
        return
      }

      setMessage('Ledig tid lagt til!')
    }

    setFormData({
      date: '',
      start_time: '',
      end_time: '',
      notes: '',
    })
    setEditingSlotId(null)
    setIsEditing(false)
    await fetchTimeSlots()
    setShowForm(false)
    setSubmitting(false)
  }

  async function handleDelete(id) {
    if (!confirm('Er du sikker på at du vil slette denne tidsslotten?')) {
      return
    }

    const { error: deleteError } = await supabase.from('time_slots').delete().eq('id', id)

    if (deleteError) {
      alert(`Feil: ${deleteError.message}`)
      return
    }

    await fetchTimeSlots()
  }

  if (loading) return <div className="text-stone-600">Laster ledige tider...</div>
  if (error) return <div className="text-red-600">Feil: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => (showForm ? handleCancel() : setShowForm(true))}
          className="rounded-lg bg-[#6f7c63] px-4 py-2 font-medium text-white transition hover:bg-[#617255]"
        >
          {showForm ? 'Avbryt' : '+ Legg til ledig tid'}
        </button>

      </div>

      {message && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{message}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <h3 className="font-semibold text-stone-900">{isEditing ? 'Rediger ledig tid' : 'Legg til ledig tid'}</h3>
          <div>
            <label className="block text-sm font-medium text-stone-700">Dag *</label>
            <input
              ref={dateInputRef}
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onFocus={() => {
                if (dateInputRef.current?.showPicker) {
                  dateInputRef.current.showPicker()
                }
              }}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none cursor-pointer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700">Starttid *</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={formData.start_time.split(':')[0] || ''}
                  onChange={(e) => updateStartTime('hour', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
                >
                  <option value="">TT</option>
                  {Array.from({ length: 24 }, (_, i) => {
                    const value = String(i).padStart(2, '0')
                    return <option key={value} value={value}>{value}</option>
                  })}
                </select>
                <select
                  value={formData.start_time.split(':')[1] || ''}
                  onChange={(e) => updateStartTime('minute', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
                >
                  <option value="">MM</option>
                  {[0, 15, 30, 45].map((minute) => {
                    const value = String(minute).padStart(2, '0')
                    return <option key={value} value={value}>{value}</option>
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Sluttid *</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={formData.end_time.split(':')[0] || ''}
                  onChange={(e) => updateEndTime('hour', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
                >
                  <option value="">TT</option>
                  {Array.from({ length: 24 }, (_, i) => {
                    const value = String(i).padStart(2, '0')
                    return <option key={value} value={value}>{value}</option>
                  })}
                </select>
                <select
                  value={formData.end_time.split(':')[1] || ''}
                  onChange={(e) => updateEndTime('minute', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
                >
                  <option value="">MM</option>
                  {[0, 15, 30, 45].map((minute) => {
                    const value = String(minute).padStart(2, '0')
                    return <option key={value} value={value}>{value}</option>
                  })}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Notater</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
              placeholder="F.eks. '1:1 healing session'"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#6f7c63] px-4 py-2 font-medium text-white transition hover:bg-[#617255] disabled:opacity-50"
            >
              {submitting ? 'Lagrer...' : isEditing ? 'Oppdater' : 'Lagre'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      {timeSlots.length === 0 ? (
        <div className="rounded-lg bg-stone-50 p-6 text-center text-stone-600">
          Ingen ledige tider opprettet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
                <tr className="border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Starttid</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Sluttid</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Booket av</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Handling</th>
                </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => {
                // Determine effective status: if there's any non-cancelled booking, treat as booked
                const hasActiveBooking = Array.isArray(slot.bookings) && slot.bookings.some((b) => b.booking_status !== 'cancelled')
                const effectiveStatus = hasActiveBooking ? 'booked' : slot.status
                const canDelete = effectiveStatus !== 'booked'

                return (
                  <tr key={slot.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm text-stone-600">{formatDateTime(slot.start_time)}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{formatDateTime(slot.end_time)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        effectiveStatus === 'available' ? 'status-green' : effectiveStatus === 'booked' ? 'status-lavendel' : 'status-red'
                      }`}>
                        {formatStatus(effectiveStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {hasActiveBooking ? (
                        (() => {
                          // Prefer to show the first non-cancelled booking's profile
                          const booking = (slot.bookings || []).find((b) => b.booking_status !== 'cancelled') || null
                          const profile = booking?.profiles || null
                          const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''
                          return name || booking?.user_id || '-'
                        })()
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(slot)}
                          className="rounded-lg btn-lavendel px-3 py-1.5 text-xs font-medium"
                        >
                          Rediger
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(slot.id)}
                          disabled={!canDelete}
                          className="rounded-lg btn-red px-3 py-1.5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {canDelete ? 'Slett' : 'Booket'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}