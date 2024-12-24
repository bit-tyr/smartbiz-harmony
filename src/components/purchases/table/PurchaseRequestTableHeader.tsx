import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Hash, 
  Building2, 
  FileCode, 
  Package, 
  Store, 
  Hash as Quantity, 
  DollarSign, 
  CreditCard, 
  Activity, 
  Calendar, 
  FileText, 
  User,
  MoreVertical
} from "lucide-react";

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
}

export const PurchaseRequestTableHeader = ({ 
  visibleColumns 
}: PurchaseRequestTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        {visibleColumns.number && (
          <TableHead className="w-[80px]">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>Número</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.laboratory && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>Laboratorio</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.budgetCode && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span>Código Presupuestal</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.product && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Producto</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.supplier && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span>Proveedor</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.quantity && (
          <TableHead className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Quantity className="h-4 w-4 text-muted-foreground" />
              <span>Cantidad</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.unitPrice && (
          <TableHead className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Precio Unitario</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.currency && (
          <TableHead className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Moneda</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.status && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Estado</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.date && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Fecha</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.observations && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Observaciones</span>
            </div>
          </TableHead>
        )}
        {visibleColumns.creator && (
          <TableHead>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Creado por</span>
            </div>
          </TableHead>
        )}
        <TableHead className="w-[50px]">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};