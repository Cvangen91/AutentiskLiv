import { Routes, Route } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import MemberLayout from '../layouts/MemberLayout'
import AdminLayout from '../layouts/AdminLayout'

import Home from '../../pages/public/Home'
import About from '../../pages/public/About'
import Login from '../../pages/public/Login'
import Register from '../../pages/public/Register'
import Courses from '../../pages/public/Courses'
import Profile from '../../pages/member/Profile'
import MyCourseDetails from '../../pages/member/MyCourseDetails'
import Admin from '../../pages/admin/Admin'

import MemberRoute from './MemberRoute'
import AdminRoute from './AdminRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<MemberRoute />}>
      <Route element={<MemberLayout />}>
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-courses/:courseId" element={<MyCourseDetails />} />
  </Route>
</Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes