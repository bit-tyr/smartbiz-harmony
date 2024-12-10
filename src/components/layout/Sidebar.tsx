import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Wrench,
  Menu,
  DollarSign
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ShoppingCart, label: "Compras", path: "/compras" },
  { icon: FileText, label: "Secretaría", path: "/secretaria" },
  { icon: Wrench, label: "Mantenimiento", path: "/mantenimiento" },
  { icon: DollarSign, label: "Cotizaciones", path: "/cotizaciones" },
];

interface QuotationData {
  date: string;
  value: number;
}

export const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await fetch('https://magicloops.dev/api/loop/d9e2aac8-f8c7-4108-b626-6da74536978a/run?input=I+love+Magic+Loops%21');
        const data = await response.json();
        
        // Verify that data is an array before setting it
        if (Array.isArray(data)) {
          setQuotations(data);
        } else {
          console.error('API response is not an array:', data);
          setError('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setError('Failed to fetch quotations');
      }
    };

    fetchQuotations();
  }, []);

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

        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold mb-4">Cotizaciones Recientes</h2>
          <div className="overflow-x-auto">
            {error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quote, index) => (
                    <TableRow key={index}>
                      <TableCell>{quote.date}</TableCell>
                      <TableCell>${quote.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};