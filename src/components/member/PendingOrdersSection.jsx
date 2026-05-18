import { useState } from 'react'

function formatDate(dateString) {
  if (!dateString) return 'Dato ukjent'
  const date = new Date(dateString)
  return Number.isNaN(date.getTime())
    ? 'Ugyldig dato'
    : date.toLocaleString('nb-NO', { dateStyle: 'short' })
}

function PendingOrdersSection({ orders, loading, errorMessage, onCancelOrder }) {
  const [expandedMobileId, setExpandedMobileId] = useState(null)

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

      <div className="mt-6 grid gap-4 md:hidden">
        {orders.map((order) => {
          const orderItem = order.order_items?.[0]
          const product = orderItem?.products
          const isPending = order.payment_status === 'pending'
          const mobileId = `order-${order.id}`
          const isExpanded = expandedMobileId === mobileId

          if (!product) return null

          return (
            <article key={`mobile-${mobileId}`} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setExpandedMobileId(isExpanded ? null : mobileId)}
                className="flex w-full items-start justify-between gap-3 text-left"
                aria-expanded={isExpanded}
              >
                <div>
                  <h4 className="text-lg font-semibold text-stone-900">{product.title}</h4>
                  <p className="mt-1 text-xs text-stone-600">Ordre: {order.id.slice(0, 8)}</p>
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{
                    backgroundColor: isPending ? 'var(--action-yellow-bg)' : 'var(--action-red-bg)',
                    color: isPending ? 'var(--action-yellow-text)' : 'var(--action-red-text)',
                  }}
                >
                  {isPending ? 'Venter' : 'Mislykket'}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4 grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Beløp</p>
                    <p className="mt-1 font-medium text-stone-900">{order.total_amount_nok} NOK</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Handling</p>
                    <button
                      type="button"
                      onClick={() => onCancelOrder(order.id)}
                      className="mt-2 w-full rounded-xl btn-red px-4 py-3 text-sm font-medium transition hover:opacity-90"
                    >
                      Avbestill bestilling
                    </button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-lg border border-stone-200 bg-white md:block">
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
                        backgroundColor: isPending ? 'var(--action-yellow-bg)' : 'var(--action-red-bg)',
                        color: isPending ? 'var(--action-yellow-text)' : 'var(--action-red-text)',
                      }}
                    >
                      {isPending ? 'Venter' : 'Mislykket'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onCancelOrder(order.id)}
                        className="rounded-lg btn-red px-3 py-2 text-sm font-medium transition hover:opacity-90"
                      >
                        Avbestill
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

