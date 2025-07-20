import React, { ReactNode } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline'; // Example icon

interface AuthFormProps {
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  footer?: ReactNode;
}


const AuthForm: React.FC<AuthFormProps> = ({ title, children, onSubmit, loading, error, footer }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-lightBg">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <SparklesIcon className="w-12 h-12 text-primary" /> {/* Placeholder icon */}
          <h2 className="mt-4 text-3xl font-bold text-center text-darkText">{title}</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition duration-200 rounded-md bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? <Spinner /> : title.includes('Login') ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {footer && <div className="mt-6 text-sm text-center text-gray-600">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthForm;