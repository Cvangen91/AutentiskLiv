import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Root() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is admin and on landing page, redirect to admin dashboard
    if (!isLoading && user?.role === 'admin' && window.location.pathname === '/') {
      navigate('/admin');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center bg-stone-50">
        <div className="text-stone-600">Laster...</div>
      </div>
    );
  }

  return <Outlet />;
}
