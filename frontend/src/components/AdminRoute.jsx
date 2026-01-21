import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminRoute({ children }) {
  const { isAuthed, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] w-full bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-md bg-white p-6 text-sm text-slate-700 shadow-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
