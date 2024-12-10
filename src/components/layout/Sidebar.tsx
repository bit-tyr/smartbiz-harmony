import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, FileText, Wrench, Home, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [quotations, setQuotations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedArea = localStorage.getItem("selectedArea");

  const fetchQuotations = async () => {
    try {
      const url = 'https://magicloops.dev/api/loop/d9e2aac8-f8c7-4108-b626-6da74536978a/run';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "input": "I love Magic Loops!" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      setQuotations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError("Error loading quotations");
    }
  };

  useEffect(() => {
    fetchQuotations();
    const interval = setInterval(fetchQuotations, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const isAdmin = true; // This should be replaced with actual admin check logic

  if (isMobile) {
    return null;
  }

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
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
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Cotizaciones
          </h2>
          <ScrollArea className="h-[300px] px-4">
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : quotations ? (
              <pre className="text-sm">{JSON.stringify(quotations, null, 2)}</pre>
            ) : (
              <div>Loading quotations...</div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}