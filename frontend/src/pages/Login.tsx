import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext'; // To potentially update context after login

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth(); // If useAuth exposes a way to re-fetch profile

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      // Fetch the profile to determine role and redirect
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        setError('Error fetching user role. Please try again.');
        console.error(profileError);
      } else {
        if (profile.role === 'landlord') {
          navigate('/landlord/dashboard');
        } else {
          navigate('/tenant/dashboard'); // Default to tenant dashboard
        }
      }
    }
    setLoading(false);
  };

  return (
    <AuthForm
      title="Login to LocaRent"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      footer={
        <>
          <p className="mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
          {/* Social login buttons can go here */}
          <div className="mt-4">
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="mt-2 flex w-full items-center justify-center rounded-md border border-gray-300 py-2.5 font-semibold text-darkText transition duration-200 hover:bg-gray-50"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" /> {/* Add google-icon.svg to public/ */}
              Login with Google
            </button>
            {/* Add Facebook login similarly */}
          </div>
        </>
      }
    >
      <div>
        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
        Forgot Password?
      </Link>
    </AuthForm>
  );
};

export default Login;