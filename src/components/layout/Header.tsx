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

export const Header = () => {
  const navigate = useNavigate();
  const selectedArea = localStorage.getItem("selectedArea") || "No seleccionada";
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          
          // Check if profile exists
          const { data: profileExists, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id);

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
                id: user.id,
                email: user.email,
                is_admin: false,
                role_id: defaultRoleId
              }]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              return;
            }
          }

          // Now fetch the profile including admin status
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }

          console.log('Profile data in Header:', profile);
          setIsAdmin(profile?.is_admin || false);
        }
      } catch (error) {
        console.error('Error getting user profile:', error);
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("selectedArea");
    navigate("/login");
    toast.success("Sesión cerrada exitosamente");
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
        
        <button className="p-2 hover:bg-accent rounded-full relative">
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg">
              <User className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium">
                {userEmail || 'Usuario'}
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