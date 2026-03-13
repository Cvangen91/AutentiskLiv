import { Mail, Instagram, Facebook } from 'lucide-react';
import logo from '../../assets/path41-4.png';

export default function Footer() {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="Autentisk Liv" className="h-10 w-auto mb-4" />
            <p className="text-stone-600 text-sm">
              En plattform for personlig vekst, autentisitet og indre ro.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Kontakt</h3>
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:post@autentiskliv.no" className="hover:text-sage-600">
                post@autentiskliv.no
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Følg oss</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/autentiskliv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-600 hover:text-sage-600 hover:bg-sage-50 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/autentiskliv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-600 hover:text-sage-600 hover:bg-sage-50 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-300 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Autentisk Liv. Alle rettigheter reservert.
        </div>
      </div>
    </footer>
  );
}