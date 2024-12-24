import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRequest } from "../types";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PurchaseRequestTableRowProps {
  request: PurchaseRequest;
  visibleColumns: Record<string, boolean>;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  userRole?: string | null;
}

const statusConfig = {
  pending: { 
    label: "Pendiente", 
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200" 
  },
  in_process: { 
    label: "En Proceso", 
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" 
  },
  purchased: { 
    label: "Comprado", 
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" 
  },
  ready_for_delivery: { 
    label: "Listo para Entrega", 
    className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200" 
  },
  delivered: { 
    label: "Entregado", 
    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200" 
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const PurchaseRequestTableRow = ({
  request,
  visibleColumns,
  onClick,
  onDelete,
  onStatusChange,
  userRole
}: PurchaseRequestTableRowProps) => {
  const canChangeStatus = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  return (
    <TableRow 
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {visibleColumns.number && (
        <TableCell className="font-medium">
          #{request.number}
        </TableCell>
      )}
      {visibleColumns.laboratory && (
        <TableCell>
          <span className="font-medium text-primary">
            {request.laboratory?.name || "-"}
          </span>
        </TableCell>
      )}
      {visibleColumns.budgetCode && (
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">{request.budget_code?.code || "-"}</div>
            <div className="text-xs text-muted-foreground">
              {request.budget_code?.description}
            </div>
          </div>
        </TableCell>
      )}
      {visibleColumns.product && (
        <TableCell>
          <div className="font-medium">
            {request.purchase_request_items?.[0]?.product?.name || "-"}
          </div>
        </TableCell>
      )}
      {visibleColumns.supplier && (
        <TableCell>
          <div className="text-muted-foreground">
            {request.purchase_request_items?.[0]?.product?.supplier?.name || "-"}
          </div>
        </TableCell>
      )}
      {visibleColumns.quantity && (
        <TableCell className="text-center font-medium">
          {request.purchase_request_items?.[0]?.quantity || "-"}
        </TableCell>
      )}
      {visibleColumns.unitPrice && (
        <TableCell className="text-right">
          <div className="font-medium">
            {request.purchase_request_items?.[0]?.unit_price
              ? formatCurrency(
                  request.purchase_request_items[0].unit_price,
                  request.purchase_request_items[0].currency
                )
              : "-"}
          </div>
        </TableCell>
      )}
      {visibleColumns.currency && (
        <TableCell className="text-center">
          <Badge variant="outline">
            {request.purchase_request_items?.[0]?.currency || "-"}
          </Badge>
        </TableCell>
      )}
      {visibleColumns.status && (
        <TableCell>
          {canChangeStatus ? (
            <Select
              value={request.status}
              onValueChange={(value) => {
                onStatusChange?.(request.id, value);
                event?.stopPropagation();
              }}
            >
              <SelectTrigger className={`w-[180px] ${statusConfig[request.status]?.className}`}>
                <SelectValue>{statusConfig[request.status]?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={statusConfig[request.status]?.className}>
              {statusConfig[request.status]?.label}
            </Badge>
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
        <TableCell>
          <div className="max-w-[200px] truncate text-muted-foreground">
            {request.observations || "-"}
          </div>
        </TableCell>
      )}
      {visibleColumns.creator && (
        <TableCell>
          <div className="font-medium">
            {request.profiles?.first_name && request.profiles?.last_name
              ? `${request.profiles.first_name} ${request.profiles.last_name}`
              : "-"}
          </div>
        </TableCell>
      )}
      <TableCell>
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(request.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};