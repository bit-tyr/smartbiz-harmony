import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, FileText, Wrench } from "lucide-react";
import { toast } from "sonner";

const AreaButton = ({ 
  icon: Icon, 
  title, 
  path 
}: { 
  icon: React.ElementType; 
  title: string; 
  path: string;
}) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      className="w-full p-8 h-auto flex flex-col items-center gap-4 hover:bg-gray-50"
      onClick={() => {
        localStorage.setItem("selectedArea", title);
        navigate(path);
        toast.success(`Área seleccionada: ${title}`);
      }}
    >
      <Icon className="h-12 w-12" />
      <span className="text-lg font-medium">{title}</span>
    </Button>
  );
};

const SelectArea = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Seleccione su Área
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AreaButton
            icon={ShoppingCart}
            title="Unidad de Compras"
            path="/compras"
          />
          <AreaButton
            icon={FileText}
            title="Secretaría"
            path="/secretaria"
          />
          <AreaButton
            icon={Wrench}
            title="Mantenimiento"
            path="/mantenimiento"
          />
        </div>
      </div>
    </div>
  );
};

export default SelectArea;