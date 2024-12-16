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
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            await supabase.auth.signOut();
            setSession(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(initialSession);

          if (initialSession?.user) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin, is_blocked')
              .eq('id', initialSession.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Error checking profile:', profileError);
              toast.error("Error al verificar permisos de usuario");
              return;
            }

            if (!profileData) {
              console.error('No profile found for user:', initialSession.user.id);
              toast.error("No se encontró el perfil del usuario");
              await supabase.auth.signOut();
              return;
            }

            if (profileData.is_blocked) {
              toast.error("Tu cuenta ha sido bloqueada");
              await supabase.auth.signOut();
              return;
            }

            if (mounted) {
              setIsAdmin(!!profileData.is_admin);
              setIsBlocked(!!profileData.is_blocked);
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error("Error al verificar la sesión");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session?.user?.id);
      
      if (!mounted) return;

      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setSession(session);
        
        if (session?.user) {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin, is_blocked')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile after auth change:', profileError);
            toast.error("Error al verificar permisos de administrador");
            return;
          }

          if (!profiles) {
            console.error('No profile found for user after auth change:', session.user.id);
            toast.error("No se encontró el perfil del usuario");
            await supabase.auth.signOut();
            return;
          }

          if (profiles.is_blocked) {
            toast.error("Tu cuenta ha sido bloqueada");
            await supabase.auth.signOut();
            return;
          }

          setIsAdmin(!!profiles.is_admin);
          setIsBlocked(!!profiles.is_blocked);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        setIsBlocked(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, isBlocked, loading };
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { session, isAdmin, isBlocked, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!session) {
    toast.error("Debes iniciar sesión para acceder a esta página");
    return <Navigate to="/login" replace />;
  }

  if (isBlocked) {
    toast.error("Tu cuenta ha sido bloqueada");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('Admin access denied. Is admin:', isAdmin);
    toast.error("No tienes permisos de administrador");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;