import { Card } from "@/components/ui/card";
import { ShoppingCart, FileText, Tool } from "lucide-react";

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
}) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="p-4 bg-corporate-100 rounded-lg">
        <Icon className="h-6 w-6 text-corporate-700" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-corporate-800">{value}</p>
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido al sistema ERP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Órdenes de Compra"
          value="12"
          icon={ShoppingCart}
        />
        <DashboardCard
          title="Documentos Pendientes"
          value="5"
          icon={FileText}
        />
        <DashboardCard
          title="Tareas de Mantenimiento"
          value="8"
          icon={Tool}
        />
      </div>
    </div>
  );
};

export default Dashboard;