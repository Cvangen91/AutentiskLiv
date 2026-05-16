import { useState } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { logout } from '../../features/auth/authService'
import AdminCoursesTab from '../../components/admin/AdminCoursesTab'
import AdminPaymentRequests from '../../components/admin/AdminPaymentRequests'
import AdminAvailableTimes from '../../components/admin/AdminAvailableTimes'

export default function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('courses')

  async function handleLogout() {
    await logout()
  }

  const tabs = [
    { id: 'courses', label: 'Kurs' },
    { id: 'payments', label: 'Betalinger' },
    { id: 'bookings', label: '1:1 Bookinger' },
  ]

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-stone-900">Admin Dashboard</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-300"
          >
            Logg ut
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-white/60 shadow-md backdrop-blur-md">
          <div className="flex gap-1 p-1 sm:p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 sm:py-2.5 ${
                  activeTab === tab.id
                    ? 'bg-[#6f7c63] text-white shadow-sm'
                    : 'bg-transparent text-stone-700 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-[2rem] border border-stone-200 bg-white/65 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          {activeTab === 'courses' && <AdminCoursesTab />}
          {activeTab === 'payments' && <AdminPaymentRequests />}
          {activeTab === 'bookings' && <AdminAvailableTimes />}
        </div>
      </div>
    </div>
  )
}