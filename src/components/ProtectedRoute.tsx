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
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error checking profile:', profileError);
            return;
          }

          // If profile doesn't exist, create it
          if (!profileData) {
            // First get a default role
            const { data: roles, error: rolesError } = await supabase
              .from('roles')
              .select('id')
              .limit(1)
              .single();

            if (rolesError) {
              console.error('Error fetching default role:', rolesError);
              return;
            }

            const { error: insertError } = await supabase.auth.updateUser({
              data: { role_id: roles.id }
            });

            if (insertError) {
              console.error('Error updating user metadata:', insertError);
              return;
            }

            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                role_id: roles.id,
                is_admin: false
              })
              .single();

            if (createProfileError) {
              console.error('Error creating profile:', createProfileError);
              return;
            }
          }

          setIsAdmin(!!profileData?.is_admin);
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
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile after auth change:', profileError);
            toast.error("Error al verificar permisos de administrador");
            return;
          }

          setIsAdmin(!!profiles?.is_admin);
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