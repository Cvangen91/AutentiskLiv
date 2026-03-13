import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users, BookOpen, Home } from 'lucide-react';
import { courses as initialCourses } from '../data/courses';
import Header from './Header';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(initialCourses);
  const [activeTab, setActiveTab] = useState<'courses' | 'users'>('courses');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Don't render if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  const deleteCourse = (courseId: string) => {
    if (confirm('Er du sikker på at du vil slette dette kurset?')) {
      setCourses(courses.filter((c) => c.id !== courseId));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold text-stone-800">
              Administrasjon
            </h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Tilbake til forsiden</span>
            </button>
          </div>
          <p className="text-stone-600">Velkommen, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">
                  {courses.length}
                </p>
                <p className="text-sm text-stone-600">Totalt kurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">
                  {courses.reduce((sum, c) => sum + c.participants, 0)}
                </p>
                <p className="text-sm text-stone-600">Totalt deltagere</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">
                  {Math.round(courses.reduce((sum, c) => sum + c.participants, 0) / courses.length)}
                </p>
                <p className="text-sm text-stone-600">Gjennomsnitt per kurs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-stone-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'courses'
                    ? 'text-sage-600 border-b-2 border-sage-600'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Kurs
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-sage-600 border-b-2 border-sage-600'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Brukere
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'courses' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-stone-800">
                    Administrer kurs
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nytt kurs</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:border-sage-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-stone-800 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-stone-600 mb-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-stone-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.participants} deltagere
                          </span>
                          <span>{course.modules.length} moduler</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => alert('Redigeringsfunksjon kommer snart')}
                          className="p-2 text-stone-600 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
                          title="Rediger"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Slett"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-6">
                  Brukeroversikt
                </h2>
                <div className="space-y-4">
                  {[
                    { id: '1', name: 'Maria Hansen', email: 'maria@example.com', courses: 2 },
                    { id: '2', name: 'Lars Olsen', email: 'lars@example.com', courses: 3 },
                    { id: '3', name: 'Inger Johansen', email: 'inger@example.com', courses: 1 },
                    { id: '4', name: 'Erik Andreassen', email: 'erik@example.com', courses: 4 },
                  ].map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-stone-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-stone-800">{user.name}</h3>
                        <p className="text-sm text-stone-600">{user.email}</p>
                      </div>
                      <div className="text-sm text-stone-600">
                        {user.courses} kurs
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-stone-800 mb-6">
              Opprett nytt kurs
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Kurstittel
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                  placeholder="F.eks. Finn din indre styrke"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Kort beskrivelse
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                  rows={2}
                  placeholder="En kort beskrivelse av kurset"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Full beskrivelse
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                  rows={4}
                  placeholder="En detaljert beskrivelse av kurset"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Kurset ville blitt opprettet her');
                    setShowCreateModal(false);
                  }}
                  className="flex-1 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                >
                  Opprett kurs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}