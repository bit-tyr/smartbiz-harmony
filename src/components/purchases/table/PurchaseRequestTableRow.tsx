import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PurchaseRequest } from "../types";
import { Archive, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PurchaseRequestTableRowProps {
  request: PurchaseRequest;
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
  onClick: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  userRole?: string | null;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelection?: boolean;
}

const statusConfig = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
};

export const PurchaseRequestTableRow = ({ 
  request, 
  visibleColumns, 
  onClick, 
  onDelete,
  onStatusChange,
  userRole,
  isSelected = false,
  onSelect,
  showSelection = false
}: PurchaseRequestTableRowProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Evitar que el clic en la casilla de selección active el onClick de la fila
    if ((e.target as HTMLElement).closest('.checkbox-cell')) {
      return;
    }
    onClick();
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic en el selector active el onClick de la fila
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleRowClick}
    >
      {showSelection && (
        <TableCell className="checkbox-cell">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label="Seleccionar solicitud"
          />
        </TableCell>
      )}
      {visibleColumns.number && (
        <TableCell className="font-medium">#{request.number}</TableCell>
      )}
      {visibleColumns.laboratory && (
        <TableCell>{request.laboratory?.name}</TableCell>
      )}
      {visibleColumns.budgetCode && (
        <TableCell>
          {request.budget_code?.code} - {request.budget_code?.description}
        </TableCell>
      )}
      {visibleColumns.product && (
        <TableCell>
          {request.purchase_request_items?.[0]?.product?.name}
        </TableCell>
      )}
      {visibleColumns.supplier && (
        <TableCell>
          {request.purchase_request_items?.[0]?.product?.supplier?.name}
        </TableCell>
      )}
      {visibleColumns.quantity && (
        <TableCell className="text-center">
          {request.purchase_request_items?.[0]?.quantity}
        </TableCell>
      )}
      {visibleColumns.unitPrice && (
        <TableCell className="text-right">
          {formatCurrency(
            request.purchase_request_items?.[0]?.unit_price || 0,
            request.purchase_request_items?.[0]?.currency || 'PEN'
          )}
        </TableCell>
      )}
      {visibleColumns.currency && (
        <TableCell className="text-center">
          {request.purchase_request_items?.[0]?.currency}
        </TableCell>
      )}
      {visibleColumns.status && (
        <TableCell onClick={handleStatusClick}>
          {userRole && ['admin', 'manager', 'purchases'].includes(userRole) ? (
            <Select
              value={request.status}
              onValueChange={(value) => onStatusChange(request.id, value)}
            >
              <SelectTrigger className={`w-[180px] ${statusConfig[request.status]?.className}`}>
                <SelectValue>{statusConfig[request.status]?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
                <SelectItem value="purchased">Comprado</SelectItem>
                <SelectItem value="ready_for_delivery">Listo para Entrega</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status]?.className}`}>
              {statusConfig[request.status]?.label}
            </span>
          )}
        </TableCell>
      )}
      {visibleColumns.date && (
        <TableCell>
          <div className="space-y-1">
            <div className="text-sm">
              {format(new Date(request.created_at), "PPP", { locale: es })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(request.created_at), "p", { locale: es })}
            </div>
          </div>
        </TableCell>
      )}
      {visibleColumns.observations && (
        <TableCell className="max-w-[200px] truncate">
          {request.observations || '-'}
        </TableCell>
      )}
      {visibleColumns.creator && (
        <TableCell>
          {request.profiles?.first_name} {request.profiles?.last_name}
        </TableCell>
      )}
      <TableCell>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(request.id);
            }}
            className="h-8 w-8"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};