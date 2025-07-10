
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthPage } from '@/components/auth/AuthPage';
import { WeatherDashboard } from '@/components/weather/WeatherDashboard';
import { NewsSection } from '@/components/news/NewsSection';
import { UserPreferences } from '@/components/preferences/UserPreferences';
import { Navigation } from '@/components/layout/Navigation';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { toast } from 'sonner';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          toast.success('Welcome back!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <AuthPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <main className="container mx-auto px-4 py-8 space-y-8">
          <WeatherDashboard />
          <NewsSection />
          <UserPreferences />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
