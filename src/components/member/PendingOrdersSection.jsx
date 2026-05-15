import { useNavigate } from 'react-router-dom'

function formatDate(dateString) {
  if (!dateString) return 'Dato ukjent'
  const date = new Date(dateString)
  return Number.isNaN(date.getTime())
    ? 'Ugyldig dato'
    : date.toLocaleString('nb-NO', { dateStyle: 'short' })
}

function PendingOrdersSection({ orders, loading, errorMessage, onRetryPayment }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Bestillinger</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Ventende bestillinger</h2>
          </div>
        </div>
        <p className="mt-6 text-stone-700">Laster bestillinger...</p>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Bestillinger</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Ventende bestillinger</h2>
          </div>
        </div>
        <p className="mt-6 text-red-700">Feil: {errorMessage}</p>
      </section>
    )
  }

  if (orders.length === 0) {
    return null
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f7c63]">Bestillinger</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Ventende bestillinger</h2>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Kurs</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Beløp</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-stone-900">Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const orderItem = order.order_items?.[0]
              const product = orderItem?.products
              const isPending = order.payment_status === 'pending'

              if (!product) return null

              return (
                <tr key={order.id} className="border-b border-stone-200 transition hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900">{product.title}</p>
                    <p className="text-xs text-stone-600">Ordre: {order.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-stone-700">{order.total_amount_nok} NOK</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{
                        backgroundColor: isPending ? 'rgb(254 243 199 / 1)' : 'rgb(254 226 226 / 1)',
                        color: isPending ? 'rgb(180 83 9 / 1)' : 'rgb(185 28 28 / 1)',
                      }}
                    >
                      {isPending ? 'Venter' : 'Mislykket'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onRetryPayment(order.id)}
                        className="rounded-lg bg-[#6f7c63] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        Fullføre
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/checkout/${product.id}`)}
                        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                      >
                        Endre
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PendingOrdersSection

