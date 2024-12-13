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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          await supabase.auth.signOut();
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(session);

        if (session) {
          // First check if profile exists
          const { data: profileExists, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id);

          if (checkError) {
            console.error('Error checking profile:', checkError);
            return;
          }

          // If profile doesn't exist, create it
          if (!profileExists || profileExists.length === 0) {
            // First get a default role
            const { data: roles, error: rolesError } = await supabase
              .from('roles')
              .select('id')
              .limit(1);

            if (rolesError) {
              console.error('Error fetching default role:', rolesError);
              return;
            }

            const defaultRoleId = roles?.[0]?.id;
            if (!defaultRoleId) {
              console.error('No default role found');
              return;
            }

            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: session.user.id,
                email: session.user.email,
                is_admin: false,
                role_id: defaultRoleId
              }]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              return;
            }
          }

          // Now fetch the profile data including admin status
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id);

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error("Error al verificar permisos de administrador");
            return;
          }

          const profile = profiles?.[0];
          console.log('Profile data in ProtectedRoute:', profile);
          setIsAdmin(!!profile?.is_admin);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error("Error al verificar la sesión");
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session?.user?.id);
      
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setSession(session);
        
        if (session) {
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id);

          if (profileError) {
            console.error('Error fetching profile after auth change:', profileError);
            toast.error("Error al verificar permisos de administrador");
            return;
          }

          const profile = profiles?.[0];
          console.log('Profile data after auth change:', profile);
          setIsAdmin(!!profile?.is_admin);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, loading };
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!session) {
    toast.error("Debes iniciar sesión para acceder a esta página");
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