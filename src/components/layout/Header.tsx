import { Bell, User, Moon, Sun, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export const Header = () => {
  const navigate = useNavigate();
  const selectedArea = localStorage.getItem("selectedArea") || "No seleccionada";
  const [userFullName, setUserFullName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, is_admin, roles (name)')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error checking profile:', profileError);
            return;
          }

          if (profile) {
            const fullName = profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : user.email;
            
            setUserFullName(fullName || 'Usuario');
            setIsAdmin(!!profile.is_admin);
            
            console.log('User role:', profile.roles?.name);
            console.log('Is admin:', profile.is_admin);
          }
        }
      } catch (error) {
        console.error('Error getting user profile:', error);
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // First clear local storage
      localStorage.removeItem("selectedArea");
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // If there's an error but it's just about the session not being found,
        // we can still proceed with the local cleanup
        if (error.message.includes("session_not_found")) {
          console.warn("Session not found during logout, proceeding with cleanup");
        } else {
          throw error;
        }
      }

      // Always navigate to login page, even if there was a session_not_found error
      navigate("/login");
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login and clear state, even if there was an error
      navigate("/login");
      toast.error("Hubo un problema al cerrar sesión, pero has sido desconectado");
    }
  };

  const handleAdminPanel = () => {
    navigate("/admin");
  };

  return (
    <header className="header">
      <div className="flex-1">
        <span className="text-sm font-medium text-muted-foreground">
          Área: {selectedArea}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdminPanel}
            className="hidden md:flex"
          >
            <Settings className="mr-2 h-4 w-4" />
            Panel Admin
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
        
        <NotificationDropdown />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg">
              <User className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium">
                {userFullName}
                {isAdmin && ' (Admin)'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={handleAdminPanel}>
                Panel de Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};