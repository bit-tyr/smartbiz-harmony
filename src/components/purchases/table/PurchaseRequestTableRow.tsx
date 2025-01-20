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
    if ((e.target as HTMLElement).closest('.checkbox-cell')) {
      return;
    }
    onClick();
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50 h-16"
      onClick={handleRowClick}
    >
      {showSelection && (
        <TableCell className="checkbox-cell w-[50px] pl-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label="Seleccionar solicitud"
          />
        </TableCell>
      )}
      
      {visibleColumns.number && (
        <TableCell className="font-medium w-[100px] whitespace-nowrap">
          #{request.number}
        </TableCell>
      )}
      
      {visibleColumns.laboratory && (
        <TableCell className="min-w-[150px] max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
          {request.laboratory?.name}
        </TableCell>
      )}
      
      {visibleColumns.budgetCode && (
        <TableCell className="min-w-[200px] max-w-[300px]">
          <div className="truncate">
            <span className="font-medium">{request.budget_code?.code}</span>
            <span className="text-muted-foreground"> - </span>
            <span className="text-sm">{request.budget_code?.description}</span>
          </div>
        </TableCell>
      )}
      
      {visibleColumns.product && (
        <TableCell className="min-w-[200px] max-w-[300px]">
          <div className="truncate font-medium">
            {request.purchase_request_items?.[0]?.product?.name}
          </div>
        </TableCell>
      )}
      
      {visibleColumns.supplier && (
        <TableCell className="min-w-[150px] max-w-[200px]">
          <div className="truncate text-muted-foreground">
            {request.purchase_request_items?.[0]?.product?.supplier?.name}
          </div>
        </TableCell>
      )}
      
      {visibleColumns.quantity && (
        <TableCell className="text-center w-[100px]">
          {request.purchase_request_items?.[0]?.quantity}
        </TableCell>
      )}
      
      {visibleColumns.unitPrice && (
        <TableCell className="text-right min-w-[120px] whitespace-nowrap">
          {formatCurrency(
            request.purchase_request_items?.[0]?.unit_price || 0,
            request.purchase_request_items?.[0]?.currency || 'PEN'
          )}
        </TableCell>
      )}
      
      {visibleColumns.currency && (
        <TableCell className="text-center w-[80px]">
          {request.purchase_request_items?.[0]?.currency}
        </TableCell>
      )}
      
      {visibleColumns.status && (
        <TableCell onClick={handleStatusClick} className="min-w-[180px]">
          {userRole && ['admin', 'manager', 'Purchases'].includes(userRole) ? (
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
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[request.status]?.className}`}>
              {statusConfig[request.status]?.label}
            </span>
          )}
        </TableCell>
      )}
      
      {visibleColumns.date && (
        <TableCell className="min-w-[150px] whitespace-nowrap">
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {format(new Date(request.created_at), "PPP", { locale: es })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(request.created_at), "p", { locale: es })}
            </div>
          </div>
        </TableCell>
      )}
      
      {visibleColumns.observations && (
        <TableCell className="min-w-[200px] max-w-[300px]">
          <div className="truncate text-sm text-muted-foreground">
            {request.observations || '-'}
          </div>
        </TableCell>
      )}
      
      {visibleColumns.creator && (
        <TableCell className="min-w-[150px] whitespace-nowrap">
          <div className="font-medium">
            {request.profiles?.first_name} {request.profiles?.last_name}
          </div>
        </TableCell>
      )}
      
      <TableCell className="w-[50px] pr-4">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(request.id);
            }}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};