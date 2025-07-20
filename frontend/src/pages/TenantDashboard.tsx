import React from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const TenantDashboard: React.FC = () => {
  const { userProfile, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container p-4 mx-auto text-center">
        <h1 className="mb-4 text-3xl font-bold text-darkText">Welcome to LocaRent!</h1>
        <p className="text-gray-600">Please login or register to start finding your perfect rental.</p>
        <Link to="/login" className="inline-block px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-opacity-90">Login / Register</Link>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto text-center">
      <h1 className="mb-4 text-3xl font-bold text-darkText">
        Welcome, {userProfile.full_name || 'Tenant'}!
      </h1>
      <p className="text-lg text-gray-700">
        Start by Browse properties near you.
      </p>
      <div className="mt-8">
        <Link
          to="/" // This will be the main search page in Sprint 2
          className="inline-block px-6 py-3 font-semibold text-white transition duration-200 rounded-md bg-primary hover:bg-opacity-90"
        >
          Browse Properties
        </Link>
      </div>
      {/* Future: Saved searches, favorite listings, chat overview */}
    </div>
  );
};

export default TenantDashboard;