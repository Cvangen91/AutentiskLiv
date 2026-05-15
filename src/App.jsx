import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AppRoutes from './app/routes/AppRoutes'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, location.search, location.hash])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  )
}

export default App