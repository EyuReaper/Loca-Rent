import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth(); // To update context after successful registration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // Pass role in user_metadata
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Update the profile table with the chosen role and full name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          role: role,
          is_landlord: role === 'landlord', // Set is_landlord based on role
          is_student: role === 'tenant' // Or a more granular way to set is_student
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        // Handle this error. It means the trigger/initial profile creation might have failed.
        setError('Error setting up user profile. Please contact support.');
        console.error('Profile update error:', profileError);
        // Consider signing out the user if profile setup failed
        await supabase.auth.signOut();
      } else {
        updateUserProfile(profileData); // Update context with new profile
        alert('Registration successful! Please check your email to verify your account.');
        navigate('/login'); // Redirect to login for email verification
      }
    }
    setLoading(false);
  };

  return (
    <AuthForm
      title="Create LocaRent Account"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      footer={
        <p className="mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      }
    >
      <div>
        <label htmlFor="full_name" className="block mb-1 text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
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
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          I want to use LocaRent as:
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="tenant"
              checked={role === 'tenant'}
              onChange={() => setRole('tenant')}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-gray-700">Tenant</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="landlord"
              checked={role === 'landlord'}
              onChange={() => setRole('landlord')}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-gray-700">Landlord</span>
          </label>
        </div>
      </div>
    </AuthForm>
  );
};

export default SignUp;