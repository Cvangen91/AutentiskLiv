import { useEffect, useMemo, useState } from 'react'
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

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    notes: '',
  })

  useEffect(() => {
    fetchTimeSlots()
  }, [])

  async function fetchTimeSlots() {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('time_slots')
      .select('id, start_time, end_time, status, notes, created_at')
      .order('start_time', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setTimeSlots([])
    } else {
      setTimeSlots(data || [])
    }

    setLoading(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function updateStartTime(part, value) {
    const [currentHour = '09', currentMinute = '00'] = formData.start_time.split(':')
    const nextValue = part === 'hour' ? `${value}:${currentMinute}` : `${currentHour}:${value}`

    setFormData((prev) => ({
      ...prev,
      start_time: nextValue,
    }))
  }

  const previewEndTime = useMemo(() => {
    if (!formData.date || !formData.start_time) {
      return ''
    }

    const [hour, minute] = formData.start_time.split(':')
    const start = new Date(`${formData.date}T${hour}:${minute}:00`)

    if (Number.isNaN(start.getTime())) {
      return ''
    }

    const end = new Date(start.getTime() + 60 * 60 * 1000)
    return end.toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })
  }, [formData.date, formData.start_time])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    if (!formData.date || !formData.start_time) {
      setMessage('Vennligst fyll inn dag og starttid')
      return
    }

    const [startHour, startMinute] = formData.start_time.split(':')
    const startTime = new Date(`${formData.date}T${startHour}:${startMinute}:00`)

    if (Number.isNaN(startTime.getTime())) {
      setMessage('Ugyldig dato eller tidspunkt')
      return
    }

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

    setSubmitting(true)

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
    setFormData({
      date: '',
      start_time: '',
      notes: '',
    })
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
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#6f7c63] px-4 py-2 font-medium text-white transition hover:bg-[#617255]"
        >
          {showForm ? 'Avbryt' : '+ Legg til ledig tid'}
        </button>

        <p className="text-sm text-stone-600">
          Alle slotter opprettes som 1 time lange tider.
        </p>
      </div>

      {message && <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{message}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Dag *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700">Starttid *</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={formData.start_time.split(':')[0] || '09'}
                  onChange={(e) => updateStartTime('hour', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const value = String(i).padStart(2, '0')
                    return <option key={value} value={value}>{value}</option>
                  })}
                </select>
                <select
                  value={formData.start_time.split(':')[1] || '00'}
                  onChange={(e) => updateStartTime('minute', e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-[#6f7c63] focus:outline-none"
                >
                  {[0, 15, 30, 45].map((minute) => {
                    const value = String(minute).padStart(2, '0')
                    return <option key={value} value={value}>{value}</option>
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Sluttid</label>
              <div className="mt-1 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-2 text-sm text-stone-600">
                {previewEndTime || 'Velg dag og starttid for å se sluttid'}
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

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#6f7c63] px-4 py-2 font-medium text-white transition hover:bg-[#617255] disabled:opacity-50"
          >
            {submitting ? 'Lagrer...' : 'Lagre'}
          </button>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Notater</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700">Handling</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => {
                const canDelete = slot.status !== 'booked'

                return (
                  <tr key={slot.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm text-stone-600">{formatDateTime(slot.start_time)}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{formatDateTime(slot.end_time)}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{formatStatus(slot.status)}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{slot.notes || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        disabled={!canDelete}
                        className="text-red-600 hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-stone-400"
                      >
                        {canDelete ? 'Slett' : 'Booket'}
                      </button>
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