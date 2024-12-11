import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, FileText, Wrench, Home, Users } from "lucide-react";

export const SidebarNav = ({ isAdmin }: { isAdmin: boolean }) => {
  const location = useLocation();

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
        <Link to="/compras">
          <Button
            variant={location.pathname === "/compras" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Compras
          </Button>
        </Link>
        <Link to="/secretaria">
          <Button
            variant={location.pathname === "/secretaria" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <FileText className="mr-2 h-4 w-4" />
            Secretaría
          </Button>
        </Link>
        <Link to="/mantenimiento">
          <Button
            variant={location.pathname === "/mantenimiento" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Mantenimiento
          </Button>
        </Link>
      </div>
    </div>
  );
};