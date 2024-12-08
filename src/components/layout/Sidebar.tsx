import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Tool,
  Menu
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ShoppingCart, label: "Compras", path: "/compras" },
  { icon: FileText, label: "Secretaría", path: "/secretaria" },
  { icon: Tool, label: "Mantenimiento", path: "/mantenimiento" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <aside className={cn("sidebar", isOpen && "open")}>
        <div className="p-6">
          <h1 className="text-2xl font-heading font-bold text-corporate-800">ERP System</h1>
        </div>
        
        <nav className="flex-1 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md mb-1 transition-colors",
                "hover:bg-corporate-50 hover:text-corporate-700",
                location.pathname === item.path
                  ? "bg-corporate-100 text-corporate-700"
                  : "text-gray-600"
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};