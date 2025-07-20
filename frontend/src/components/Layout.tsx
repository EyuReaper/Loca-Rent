import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { session, userProfile, signOut, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-white shadow-md">
        <nav className="container flex items-center justify-between mx-auto">
          <Link to="/" className="text-2xl font-bold text-primary">
            LocaRent
          </Link>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            ) : session && userProfile ? (
              <>
                <span className="hidden text-sm text-darkText sm:inline">
                  Welcome, {userProfile.full_name || 'User'}!
                </span>
                {userProfile.role === 'landlord' && (
                  <Link to="/landlord/dashboard" className="text-darkText hover:text-primary">
                    Dashboard
                  </Link>
                )}
                {userProfile.role === 'tenant' && (
                  <Link to="/tenant/dashboard" className="text-darkText hover:text-primary">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-darkText hover:text-primary">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 text-sm font-semibold text-white rounded-md bg-primary hover:bg-opacity-90"
                >
                  Register
                </Link>
              </>
            )}
            {/* Language Switcher Placeholder */}
            {/* <select className="p-1 ml-2 text-sm bg-white border border-gray-300 rounded">
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
            </select> */}
          </div>
        </nav>
      </header>
      <main className="flex-grow">{children}</main>
      {/* Optional Footer */}
      {/* <footer className="p-4 text-sm text-center text-white bg-darkText">
        &copy; {new Date().getFullYear()} LocaRent. All rights reserved.
      </footer> */}
    </div>
  );
};

export default Layout;