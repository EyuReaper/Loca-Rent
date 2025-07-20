import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-lightBg p-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
      <p className="mb-8 text-2xl text-darkText">Page Not Found</p>
      <p className="mb-8 text-lg text-gray-700">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 font-semibold text-white transition duration-200 rounded-md bg-primary hover:bg-opacity-90"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;