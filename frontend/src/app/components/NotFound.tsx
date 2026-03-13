import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-semibold text-stone-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-stone-700 mb-4">
          Siden ble ikke funnet
        </h2>
        <p className="text-stone-600 mb-8">
          Siden du leter etter finnes ikke eller har blitt flyttet.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Tilbake til forsiden</span>
        </button>
      </div>
    </div>
  );
}
