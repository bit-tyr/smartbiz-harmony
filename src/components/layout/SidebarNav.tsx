import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import { ShoppingCart, FileText, Wrench, Home, Users } from "lucide-react";
=======
import { ShoppingCart, FileText, Wrench, Home, Users, Database, Plane } from "lucide-react";
>>>>>>> Stashed changes
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SidebarNavProps {
  isAdmin: boolean;
}

export const SidebarNav = ({ isAdmin }: SidebarNavProps) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        if (profile?.role_id) {
          const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();

          if (roleError) {
            console.error('Error fetching role:', roleError);
            return;
          }

          console.log('Role data:', role);
          
          if (role?.name) {
            console.log('Role name:', role.name);
            setUserRole(role.name);
          }
        }
      }
    };

    getUserRole();
  }, []);

  const showPurchasesLink = isAdmin || userRole === 'Purchases';
  const showMaintenanceLink = isAdmin || userRole === 'Maintenance';
  const showSecretaryLink = isAdmin || userRole === 'Secretary';
<<<<<<< Updated upstream
=======
  const showMasterDataLink = isAdmin || userRole === 'Purchases';
>>>>>>> Stashed changes

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Menu
      </h2>
      <div className="space-y-1">
        <Link to="/">
          <Button
            variant={location.pathname === "/" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        
        {isAdmin && (
          <Link to="/admin">
            <Button
              variant={location.pathname === "/admin" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        )}

        <Link to="/viajes">
          <Button
            variant={location.pathname === "/viajes" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Plane className="mr-2 h-4 w-4" />
            Viajes
          </Button>
        </Link>

        {showPurchasesLink && (
          <Link to="/compras">
            <Button
              variant={location.pathname === "/compras" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Compras
            </Button>
          </Link>
        )}

        {showSecretaryLink && (
          <Link to="/secretaria">
            <Button
              variant={location.pathname === "/secretaria" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Secretaría
            </Button>
          </Link>
        )}

        {showMaintenanceLink && (
          <Link to="/mantenimiento">
            <Button
              variant={location.pathname === "/mantenimiento" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Mantenimiento
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};