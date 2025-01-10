import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
    };

    checkSession();
  }, []);

  // Redirect to login if not authenticated, otherwise to dashboard
  return <Navigate to="/login" replace />;
};

export default Index;