import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import './Layout.css'

function PublicLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="layout">
      <Navbar />
      <main
        className="layout__main"
        style={isHome ? { paddingTop: 0, maxWidth: '100%' } : undefined}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout