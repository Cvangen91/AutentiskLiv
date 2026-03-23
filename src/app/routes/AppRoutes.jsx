import { Routes, Route } from 'react-router-dom'
import Home from '../../pages/public/Home'
import Login from '../../pages/public/Login'
import Register from '../../pages/public/Register'
import Profile from '../../pages/member/Profile'
import Admin from '../../pages/admin/Admin'
import MemberRoute from './MemberRoute'
import AdminRoute from './AdminRoute'

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<MemberRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
  )
}

export default AppRoutes