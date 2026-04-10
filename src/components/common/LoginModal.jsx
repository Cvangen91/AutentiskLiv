import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export default function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err?.message || 'En feil oppstod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-2xl font-semibold text-stone-800">
          {isLogin ? 'Logg inn' : 'Registrer deg'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-stone-700">
                Navn
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:outline-none"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-stone-700">
              E-post
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-stone-700">
              Passord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-stone-700 py-3 text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Vennligst vent...' : isLogin ? 'Logg inn' : 'Registrer deg'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-stone-700 hover:text-stone-900"
          >
            {isLogin ? 'Har du ikke konto? Registrer deg' : 'Har du allerede konto? Logg inn'}
          </button>
        </div>

        <div className="mt-6 rounded-lg bg-stone-50 p-4">
          <p className="mb-2 text-xs text-stone-600">Demo-innlogging:</p>
          <p className="text-xs text-stone-600">Admin: admin@autentiskliv.no / admin123</p>
          <p className="text-xs text-stone-600">Bruker: user@example.com / user123</p>
        </div>
      </div>
    </div>
  );
}