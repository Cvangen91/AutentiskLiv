import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { logout } from '../../features/auth/authService'
import { supabase } from '../../lib/supabase/client'
import ProfileSummarySection from '../../components/member/ProfileSummarySection'
import ProfileContactSection from '../../components/member/ProfileContactSection'
import MyCoursesSection from '../../components/member/MyCoursesSection'

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

  async function handleLogout() {
    await logout()
  }

  useEffect(() => {
    async function fetchProfileAndCourses() {
      if (!user) return

      setProfileLoading(true)
      setCoursesLoading(true)
      setProfileErrorMessage('')
      setCoursesErrorMessage('')

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

        <MyCoursesSection
          regularCourses={regularCourses}
          oneToOneCourses={oneToOneCourses}
          coursesLoading={coursesLoading}
          coursesErrorMessage={coursesErrorMessage}
          onOpenCourse={(courseId) => navigate(`/my-courses/${courseId}`)}
        />
      </div>
    </div>
  )
}

export default Profile
