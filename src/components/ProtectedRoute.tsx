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
  const [loading, setLoading] = useState<boolean>(true);
  const [adminCheckComplete, setAdminCheckComplete] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        setAdminCheckComplete(false);
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            // Clear local storage and session
            localStorage.clear();
            await supabase.auth.signOut();
            setSession(null);
            setLoading(false);
            setAdminCheckComplete(true);
          }
          return;
        }

        if (mounted) {
          setSession(initialSession);

          if (initialSession?.user) {
            // Verificar si es admin en la tabla admin_users
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('user_id')
              .eq('user_id', initialSession.user.id)
              .maybeSingle();

            console.log('Admin check:', {
              userId: initialSession.user.id,
              adminData,
              adminError
            });

            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin, is_blocked')
              .eq('id', initialSession.user.id)
              .maybeSingle();

            console.log('Profile check:', {
              userId: initialSession.user.id,
              profileData,
              profileError
            });

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

            const isUserAdmin = !!adminData || !!profileData.is_admin;
            console.log('Admin status:', {
              hasAdminData: !!adminData,
              profileIsAdmin: !!profileData.is_admin,
              finalIsAdmin: isUserAdmin
            });

            if (mounted) {
              setIsAdmin(isUserAdmin);
              setIsBlocked(!!profileData.is_blocked);
              setAdminCheckComplete(true);
            }
          } else {
            setAdminCheckComplete(true);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error("Error al verificar la sesión");
        // Clear local storage and session on error
        localStorage.clear();
        await supabase.auth.signOut();
        if (mounted) {
          setAdminCheckComplete(true);
        }
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
        setAdminCheckComplete(false);
        setSession(session);
        
        if (session?.user) {
          // Verificar si es admin en la tabla admin_users
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          console.log('Auth change - Admin check:', {
            userId: session.user.id,
            adminData,
            adminError
          });

          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin, is_blocked')
            .eq('id', session.user.id)
            .maybeSingle();

          console.log('Auth change - Profile check:', {
            userId: session.user.id,
            profiles,
            profileError
          });

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

          const isUserAdmin = !!adminData || !!profiles.is_admin;
          console.log('Auth change - Admin status:', {
            hasAdminData: !!adminData,
            profileIsAdmin: !!profiles.is_admin,
            finalIsAdmin: isUserAdmin
          });

          setIsAdmin(isUserAdmin);
          setIsBlocked(!!profiles.is_blocked);
          setAdminCheckComplete(true);
        } else {
          setAdminCheckComplete(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        setIsBlocked(false);
        setAdminCheckComplete(true);
        // Clear local storage on sign out
        localStorage.clear();
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, isBlocked, loading, adminCheckComplete };
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { session, isAdmin, isBlocked, loading, adminCheckComplete } = useAuth();

  if (loading || !adminCheckComplete) {
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
    console.log('Admin access denied. Is admin:', isAdmin, 'Admin check complete:', adminCheckComplete);
    toast.error("No tienes permisos de administrador");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;