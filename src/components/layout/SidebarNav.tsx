import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, FileText, Wrench, Home, Users, Database } from "lucide-react";
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            roles (
              name
            )
          `)
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          return;
        }

        if (profile?.roles) {
          setUserRole(profile.roles.name);
        }
      }
    };

    getUserRole();
  }, []);

  const showPurchasesLink = isAdmin || userRole?.toLowerCase() === 'purchases' || userRole?.toLowerCase() === 'user';
  const showMaintenanceLink = isAdmin || userRole?.toLowerCase() === 'maintenance';
  const showSecretaryLink = isAdmin || userRole?.toLowerCase() === 'secretary';
  const showMasterDataLink = isAdmin || userRole?.toLowerCase() === 'purchases';

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Menu
      </h2>
      <div className="space-y-1">
        <Link to="/dashboard">
          <Button
            variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
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

        {showMasterDataLink && (
          <Link to="/datos-maestros">
            <Button
              variant={location.pathname === "/datos-maestros" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Database className="mr-2 h-4 w-4" />
              Datos Maestros
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};