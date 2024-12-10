import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnSelectorProps {
  visibleColumns: {
    number: boolean;
    laboratory: boolean;
    budgetCode: boolean;
    product: boolean;
    supplier: boolean;
    quantity: boolean;
    unitPrice: boolean;
    currency: boolean;
    status: boolean;
    date: boolean;
    observations: boolean;
  };
  onColumnChange: (column: string, checked: boolean) => void;
}

export const ColumnSelector = ({ 
  visibleColumns, 
  onColumnChange 
}: ColumnSelectorProps) => {
  return (
    <div className="mb-4 flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Columnas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={visibleColumns.number}
            onCheckedChange={(checked) => onColumnChange("number", checked)}
          >
            Número
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.laboratory}
            onCheckedChange={(checked) => onColumnChange("laboratory", checked)}
          >
            Laboratorio
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.budgetCode}
            onCheckedChange={(checked) => onColumnChange("budgetCode", checked)}
          >
            Código Presupuestal
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.product}
            onCheckedChange={(checked) => onColumnChange("product", checked)}
          >
            Producto
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.supplier}
            onCheckedChange={(checked) => onColumnChange("supplier", checked)}
          >
            Proveedor
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.quantity}
            onCheckedChange={(checked) => onColumnChange("quantity", checked)}
          >
            Cantidad
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.unitPrice}
            onCheckedChange={(checked) => onColumnChange("unitPrice", checked)}
          >
            Precio Unitario
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.currency}
            onCheckedChange={(checked) => onColumnChange("currency", checked)}
          >
            Moneda
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.status}
            onCheckedChange={(checked) => onColumnChange("status", checked)}
          >
            Estado
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.date}
            onCheckedChange={(checked) => onColumnChange("date", checked)}
          >
            Fecha
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={visibleColumns.observations}
            onCheckedChange={(checked) => onColumnChange("observations", checked)}
          >
            Observaciones
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};