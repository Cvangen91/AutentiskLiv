import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, Users } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { courses } from '../data/courses';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const courseImages = [
  'https://images.unsplash.com/photo-1758607234692-51ac051a2a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwd29tYW4lMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NzI3MDcyMzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1758274251489-bcf562ae7da7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0d28lMjB3b21lbiUyMHRhbGtpbmclMjBuYXR1cmV8ZW58MXx8fHwxNzcyODA4Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1735753069477-39ee2788c9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBzdW5saWdodCUyMHBlYWNlZnVsfGVufDF8fHx8MTc3MjgwODc5OXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1619781458519-5c6115c0ee98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwd29tYW4lMjBzdW5yaXNlfGVufDF8fHx8MTc3MjgwODgwMHww&ixlib=rb-4.1.0&q=80&w=1080',
];

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-stone-800 mb-4">
            Kurset ble ikke funnet
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
          >
            Tilbake til forsiden
          </button>
        </div>
      </div>
    );
  }

  const courseIndex = courses.findIndex((c) => c.id === courseId);
  const courseImage = courseImages[courseIndex] || courseImages[0];

  const handleJoinCourse = () => {
    if (!user) {
      alert('Vennligst logg inn for å bli med på kurset');
      return;
    }
    setJoined(true);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] bg-stone-800 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={courseImage}
            alt={course.title}
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
        <div className="absolute top-8 left-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tilbake</span>
          </button>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        {/* Course Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-4xl font-semibold text-stone-800">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-stone-600 bg-stone-100 px-4 py-2 rounded-lg">
              <Users className="w-5 h-5" />
              <span className="text-sm">{course.participants} deltagere</span>
            </div>
          </div>

          <p className="text-lg text-stone-600 mb-8">
            {course.fullDescription}
          </p>

          {/* What You'll Learn */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-stone-800 mb-4">
              Hva du vil lære
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {course.whatYouLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-sage-600" />
                  </div>
                  <span className="text-stone-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Modules */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-stone-800 mb-4">
              Kursmoduler
            </h2>
            <div className="space-y-3">
              {course.modules.map((module, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-sage-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-stone-700">{module}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Join Button */}
          <div className="border-t border-stone-200 pt-8">
            {joined ? (
              <div className="text-center p-6 bg-sage-50 rounded-lg">
                <Check className="w-12 h-12 text-sage-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-stone-800 mb-2">
                  Du er nå med på kurset!
                </h3>
                <p className="text-stone-600">
                  Du vil motta en e-post med mer informasjon om hvordan du kommer i gang.
                </p>
              </div>
            ) : (
              <button
                onClick={handleJoinCourse}
                className="w-full py-4 bg-sage-600 text-white text-lg rounded-lg hover:bg-sage-700 transition-colors"
              >
                Bli med på kurset
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
