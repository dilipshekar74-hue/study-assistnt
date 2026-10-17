import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useSessionStore } from '../store/useSessionStore.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        // Fallback profile constructed from user metadata
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        setProfile({
          id: userId,
          email: user?.email,
          full_name:
            user?.user_metadata?.full_name ||
            user?.email?.split('@')[0] ||
            'Scholar',
          academicLevel:
            user?.user_metadata?.academic_level || 'Undergraduate',
          major:
            user?.user_metadata?.major || 'Physics & Applied Mathematics',
          socraticFriction: 0.7,
        });
      }
    } catch {
      // Silently fall back to default metadata
      setProfile((prev) => prev || { id: userId, academicLevel: 'Undergraduate' });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        useSessionStore.getState().initSessionSync(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
        useSessionStore.getState().initSessionSync(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback((email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUp = useCallback((email, password, fullName, metadata = {}) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          academic_level: metadata.academicLevel || 'Undergraduate',
          major: metadata.major || 'Physics',
          ...metadata,
        },
      },
    });
  }, []);

  const signOut = useCallback(() => {
    return supabase.auth.signOut();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

export default useAuth;
