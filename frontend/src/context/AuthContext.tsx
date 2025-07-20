import React, { createContext, useContext, usestate, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface AuthContextType {
    session: session | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchsessionAndProfile = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                await fetchUserProfile(session.user.id);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        };
        fetchsessionAndProfile();
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        console.warn('Profile not found for user. Creating a default one.');
        // This can happen if profile creation trigger is slow or not configured
        await createDefaultProfile(userId);
      } else if (error) {
        throw error;
      } else if (data) {
        setUserProfile(data as UserProfile);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
      setUserProfile(null); // Ensure profile is null on error
    }
    };
    
    const createDefaultProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert([{ id: userId, full_name: '', role: 'tenant', is_landlord: false, is_verified: false }])
                .select()
                .single();
            if (error) throw error;
            setUserProfile(data as UserProfile);
        } catch (error: any) {
            console.error('Error creating default profile:', error.message);
        }
    };

    const signOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            setSession(null);
            setUserProfile(null);
        }
        setLoading(false);
    };

    const updateUserProfile = (profile: partial<UserProfile>) => {
// this updates the local state. DB update would happen via an API call.
       const updateUserProfile = (profile: Partial<UserProfile>) => {
    // This updates the local state. Actual DB update would happen via an API call.
    setUserProfile(prev => prev ? { ...prev, ...profile } : null);
  };
    
        
return (
    <AuthContext.Provider value={{ session, userProfile, loading, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
    };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};