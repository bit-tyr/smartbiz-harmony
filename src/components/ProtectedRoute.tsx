import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LoadingSpinner } from "./ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin, is_blocked')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          if (profile?.is_blocked) {
            await supabase.auth.signOut();
            toast.error("Tu cuenta ha sido bloqueada. Contacta al administrador.");
            setSession(null);
            return;
          }

          setIsAdmin(profile?.is_admin || false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, is_blocked')
          .eq('id', session.user.id)
          .single();

        if (profile?.is_blocked) {
          await supabase.auth.signOut();
          toast.error("Tu cuenta ha sido bloqueada. Contacta al administrador.");
          setSession(null);
          return;
        }

        setIsAdmin(profile?.is_admin || false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isAdmin, loading };
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    toast.error("No tienes permisos de administrador");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;