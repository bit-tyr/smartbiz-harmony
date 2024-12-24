import { Button } from "@/components/ui/button";
import { Columns } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnSelectorProps {
  visibleColumns: Record<string, boolean>;
  onColumnChange: (column: string, checked: boolean) => void;
}

const columnLabels: Record<string, string> = {
  number: "Número",
  laboratory: "Laboratorio",
  budgetCode: "Código Presupuestal",
  product: "Producto",
  supplier: "Proveedor",
  quantity: "Cantidad",
  unitPrice: "Precio Unitario",
  currency: "Moneda",
  status: "Estado",
  date: "Fecha",
  observations: "Observaciones",
  creator: "Creado por",
};

export const ColumnSelector = ({
  visibleColumns,
  onColumnChange,
}: ColumnSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto bg-background">
          <Columns className="mr-2 h-4 w-4" />
          Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(columnLabels).map(([key, label]) => (
          <DropdownMenuCheckboxItem
            key={key}
            className="capitalize"
            checked={visibleColumns[key]}
            onCheckedChange={(checked) => onColumnChange(key, checked)}
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};