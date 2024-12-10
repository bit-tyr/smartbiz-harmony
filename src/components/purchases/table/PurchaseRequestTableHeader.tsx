import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  };
}

export const PurchaseRequestTableHeader = ({ 
  visibleColumns 
}: PurchaseRequestTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
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
      </TableRow>
    </TableHeader>
  );
};