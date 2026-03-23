import './App.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/routes/AppRoutes'
import Navbar from './components/layout/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App