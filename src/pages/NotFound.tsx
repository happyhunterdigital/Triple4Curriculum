import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page not found: Triple 4 Curriculum';
  }, []);

  return (
    <div className="bg-white border border-black/10 rounded-xl p-8 text-center max-w-xl mx-auto my-6" role="alert">
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">Error 404</p>
      <h1 className="text-xl font-bold mt-1">Page not found</h1>
      <p className="text-sm mt-2 text-neutral-600">
        The route “{location.pathname}” does not exist. It may have moved or the link may be
        outdated.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
        <button
          type="button"
          className="underline font-medium"
          onClick={() => navigate('/dashboard')}
        >
          Back to dashboard
        </button>
        <Link to="/" className="underline">
          Home
        </Link>
        <Link to="/contact" className="underline">
          Contact us
        </Link>
      </div>
    </div>
  );
};
