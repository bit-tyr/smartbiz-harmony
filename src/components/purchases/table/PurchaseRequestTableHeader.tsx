import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface PurchaseRequestTableHeaderProps {
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
    creator: boolean;
  };
  showSelection?: boolean;
  onSelectAll?: () => void;
  allSelected?: boolean;
}

export const PurchaseRequestTableHeader = ({ 
  visibleColumns,
  showSelection = false,
  onSelectAll,
  allSelected = false
}: PurchaseRequestTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        {showSelection && (
          <TableHead className="w-[50px]">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Seleccionar todas las solicitudes"
            />
          </TableHead>
        )}
        {visibleColumns.number && <TableHead>Número</TableHead>}
        {visibleColumns.laboratory && <TableHead>Laboratorio</TableHead>}
        {visibleColumns.budgetCode && <TableHead>Código Presupuestal</TableHead>}
        {visibleColumns.product && <TableHead>Producto</TableHead>}
        {visibleColumns.supplier && <TableHead>Proveedor</TableHead>}
        {visibleColumns.quantity && <TableHead>Cantidad</TableHead>}
        {visibleColumns.unitPrice && <TableHead>Precio Unitario</TableHead>}
        {visibleColumns.currency && <TableHead>Moneda</TableHead>}
        {visibleColumns.status && <TableHead>Estado</TableHead>}
        {visibleColumns.date && <TableHead>Fecha</TableHead>}
        {visibleColumns.observations && <TableHead>Observaciones</TableHead>}
        {visibleColumns.creator && <TableHead>Creador</TableHead>}
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};