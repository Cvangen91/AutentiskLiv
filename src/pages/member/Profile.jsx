import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'
import ProfileSummarySection from '../../components/member/ProfileSummarySection'
import ProfileContactSection from '../../components/member/ProfileContactSection'
import MyCoursesSection from '../../components/member/MyCoursesSection'
import PendingOrdersSection from '../../components/member/PendingOrdersSection'

const EMPTY_PROFILE = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  zipcode: '',
  city: '',
}

function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileErrorMessage, setProfileErrorMessage] = useState('')
  const [profileSaveMessage, setProfileSaveMessage] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [myCourses, setMyCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesErrorMessage, setCoursesErrorMessage] = useState('')

  const [pendingOrders, setPendingOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersErrorMessage, setOrdersErrorMessage] = useState('')

  const [oneToOneBookings, setOneToOneBookings] = useState([])
  const [oneToOneLoading, setOneToOneLoading] = useState(true)
  const [oneToOneErrorMessage, setOneToOneErrorMessage] = useState('')

  async function handleLogout() {
    await logout()
  }

  async function handleCancelPendingOrder(orderId) {
    const order = pendingOrders.find((item) => item.id === orderId)

    if (!order) return

    const proceed = window.confirm('Er du sikker på at du vil avbestille denne bestillingen?')
    if (!proceed) return

    setOrdersLoading(true)
    setOrdersErrorMessage('')

    try {
      const productId = order.order_items?.[0]?.product_id || order.order_items?.[0]?.products?.id || null

      if (productId) {
        const { data: bookingRows, error: bookingError } = await supabase
          .from('bookings')
          .select('id, time_slot_id, created_at, booking_status, status')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .neq('booking_status', 'cancelled')
          .order('created_at', { ascending: true })

        if (bookingError) throw new Error(bookingError.message)

        const orderTime = new Date(order.created_at || Date.now()).getTime()
        const booking = (bookingRows || []).slice().sort((a, b) => {
          const aTime = new Date(a.created_at || 0).getTime()
          const bTime = new Date(b.created_at || 0).getTime()
          return Math.abs(aTime - orderTime) - Math.abs(bTime - orderTime)
        })[0] || null

        if (booking?.id) {
          const { error: bookingUpdateError } = await supabase
            .from('bookings')
            .update({ booking_status: 'cancelled', status: 'cancelled' })
            .eq('id', booking.id)

          if (bookingUpdateError) throw new Error(bookingUpdateError.message)

          if (booking.time_slot_id) {
            const { error: slotError } = await supabase
              .from('time_slots')
              .update({ status: 'available' })
              .eq('id', booking.time_slot_id)

            if (slotError) throw new Error(slotError.message)
          }

          setOneToOneBookings((prev) => prev.filter((b) => b.id !== booking.id))
        }
      }

      const { error: paymentRequestError } = await supabase
        .from('payment_requests')
        .delete()
        .eq('order_id', orderId)

      if (paymentRequestError) throw new Error(paymentRequestError.message)

      const { error: orderItemError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (orderItemError) throw new Error(orderItemError.message)

      const { error: orderDeleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (orderDeleteError) throw new Error(orderDeleteError.message)

      setPendingOrders((prev) => prev.filter((item) => item.id !== orderId))
    } catch (err) {
      setOrdersErrorMessage(err.message || 'Kunne ikke avbestille bestillingen')
    } finally {
      setOrdersLoading(false)
    }
  }

  async function handleCancelBooking(bookingId) {
    if (!bookingId) return

    const proceed = window.confirm('Er du sikker på at du vil avbestille denne timen?')
    if (!proceed) return

    setOneToOneLoading(true)
    setOneToOneErrorMessage('')

    try {
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .select('id, time_slot_id')
        .eq('id', bookingId)
        .maybeSingle()

      if (bookingErr) throw new Error(bookingErr.message)

      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ booking_status: 'cancelled', status: 'cancelled' })
        .eq('id', bookingId)

      if (updateErr) throw new Error(updateErr.message)

      if (booking?.time_slot_id) {
        const { error: slotErr } = await supabase
          .from('time_slots')
          .update({ status: 'available' })
          .eq('id', booking.time_slot_id)

        if (slotErr) console.warn('Kunne ikke markere tidslot som tilgjengelig:', slotErr.message)
      }

      setOneToOneBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch (err) {
      setOneToOneErrorMessage(err.message || 'Kunne ikke avbestille timen')
    } finally {
      setOneToOneLoading(false)
    }
  }

  useEffect(() => {
    async function fetchProfileAndCourses() {
      if (!user) return

      setProfileLoading(true)
      setCoursesLoading(true)
      setOrdersLoading(true)
      setOneToOneLoading(true)
      setProfileErrorMessage('')
      setCoursesErrorMessage('')
      setOrdersErrorMessage('')
      setOneToOneErrorMessage('')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, zipcode, city')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        setProfileErrorMessage(profileError.message)
      } else {
        const metadata = user.user_metadata || {}
        setProfileForm({
          first_name: profileData?.first_name || metadata.first_name || '',
          last_name: profileData?.last_name || metadata.last_name || '',
          email: user.email || '',
          phone: profileData?.phone || metadata.phone || '',
          address: profileData?.address || metadata.address || '',
          zipcode: profileData?.zipcode || metadata.zipcode || '',
          city: profileData?.city || metadata.city || '',
        })
      }

      setProfileLoading(false)

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          courses (
            id,
            delivery_mode,
            product_id,
            products (
              id,
              title,
              description,
              cover_image_url
            )
          )
        `)
        .eq('user_id', user.id)

      if (enrollmentsError) {
        setCoursesErrorMessage(enrollmentsError.message)
      } else {
        setMyCourses(enrollmentsData || [])
      }

      setCoursesLoading(false)

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          booking_status,
          created_at,
          product_id,
          start_time,
          end_time,
          time_slot_id,
          products (
            id,
            title,
            description,
            cover_image_url,
            courses (
              id,
              delivery_mode,
              start_at
            )
          ),
          time_slots (
            id,
            start_time,
            end_time,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        setOneToOneErrorMessage(bookingsError.message)
      } else {
        setOneToOneBookings((bookingsData || []).filter((booking) => booking.booking_status !== 'cancelled' && booking.status !== 'cancelled'))
      }

      setOrdersLoading(false)
      setOneToOneLoading(false)

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount_nok,
          payment_status,
          order_items (
            product_id,
            products (
              id,
              title,
              description,
              cover_image_url
            )
          ),
          payment_requests (
            notes,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'pending')

      if (ordersError) {
        setOrdersErrorMessage(ordersError.message)
      } else {
        const visiblePendingOrders = (ordersData || []).filter((order) => {
          const paymentRequests = Array.isArray(order.payment_requests)
            ? order.payment_requests
            : order.payment_requests
              ? [order.payment_requests]
              : []

          return !paymentRequests.some((paymentRequest) => paymentRequest?.status === 'deleted')
        })

        setPendingOrders(visiblePendingOrders)
      }

      setOrdersLoading(false)
    }

    fetchProfileAndCourses()
  }, [user])

  const oneToOneCourses = useMemo(
    () => myCourses.filter((enrollment) => enrollment?.courses?.delivery_mode === 'one_to_one'),
    [myCourses]
  )

  const regularCourses = useMemo(
    () => myCourses.filter((enrollment) => enrollment?.courses?.delivery_mode !== 'one_to_one'),
    [myCourses]
  )

  function handleProfileChange(event) {
    const { name, value } = event.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleEditProfile() {
    setProfileSaveMessage('')
    setIsEditingProfile(true)
  }

  function handleCancelEditProfile() {
    setProfileSaveMessage('')
    setIsEditingProfile(false)
  }

  async function handleSaveProfile(event) {
    event.preventDefault()

    if (!user) return

    setProfileSaveMessage('Lagrer profil...')
    setProfileErrorMessage('')

    const payload = {
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
      phone: profileForm.phone.trim(),
      address: profileForm.address.trim(),
      zipcode: profileForm.zipcode.trim(),
      city: profileForm.city.trim(),
    }

    const nextEmail = profileForm.email.trim()

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)

    if (profileUpdateError) {
      setProfileSaveMessage('')
      setProfileErrorMessage(profileUpdateError.message)
      return
    }

    const authUpdateInput = { data: payload }
    if (nextEmail && nextEmail !== user.email) {
      authUpdateInput.email = nextEmail
    }

    const { error: authUpdateError } = await supabase.auth.updateUser(authUpdateInput)

    if (authUpdateError) {
      setProfileSaveMessage('')
      setProfileErrorMessage(authUpdateError.message)
      return
    }

    if (authUpdateInput.email) {
      setProfileSaveMessage('Profilen er oppdatert. Sjekk e-post for å bekrefte ny adresse.')
    } else {
      setProfileSaveMessage('Profilen er oppdatert.')
    }
    setIsEditingProfile(false)
  }

  const fullName = `${profileForm.first_name || ''} ${profileForm.last_name || ''}`.trim()

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#ece7dd] px-4 pb-16 pt-28 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ProfileSummarySection
          fullName={fullName}
          profileLoading={profileLoading}
          onLogout={handleLogout}
        />

        <ProfileContactSection
          isEditingProfile={isEditingProfile}
          profileForm={profileForm}
          profileErrorMessage={profileErrorMessage}
          profileSaveMessage={profileSaveMessage}
          onEditProfile={handleEditProfile}
          onCancelEditProfile={handleCancelEditProfile}
          onSaveProfile={handleSaveProfile}
          onProfileChange={handleProfileChange}
        />

        <PendingOrdersSection
          orders={pendingOrders}
          loading={ordersLoading}
          errorMessage={ordersErrorMessage}
          onCancelOrder={handleCancelPendingOrder}
        />

        <MyCoursesSection
          regularCourses={regularCourses}
          oneToOneCourses={oneToOneCourses}
          oneToOneBookings={oneToOneBookings}
          coursesLoading={coursesLoading}
          oneToOneLoading={oneToOneLoading}
          coursesErrorMessage={coursesErrorMessage}
          oneToOneErrorMessage={oneToOneErrorMessage}
          onOpenCourse={(courseId) => navigate(`/my-courses/${courseId}`)}
          onCancelBooking={handleCancelBooking}
        />
      </div>
    </div>
  )
}

export default Profile
