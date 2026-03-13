import { Link, useNavigate } from 'react-router';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import LoginModal from './LoginModal';
import logo from "../../assets/path41-4.png";

export default function Header() {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Autentisk Liv" className="h-12 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-stone-700 hover:text-sage-600 transition-colors">
              Forside
            </Link>
            <a href="#courses" className="text-stone-700 hover:text-sage-600 transition-colors">
              Kurs
            </a>
            <a href="#about" className="text-stone-700 hover:text-sage-600 transition-colors">
              Om Anne
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-sage-600" />
                  <span className="text-stone-700 hidden sm:inline">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-600 hover:text-stone-800 transition-colors"
                  title="Logg ut"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 bg-[#496649] text-white rounded-lg hover:bg-[#3c523c] transition-colors"
              >
                Logg inn
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}