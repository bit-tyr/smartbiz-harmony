import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MoreVertical, Edit, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { statusConfig } from "../PurchaseRequestList";
import { PurchaseRequest } from "@/components/purchases/types";

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
  onDelete: (requestId: string) => void;
  onStatusChange: (requestId: string, newStatus: string) => void;
  userRole: string | null;
  isSelected: boolean;
  onSelect: () => void;
  showSelection: boolean;
}

export const PurchaseRequestTableRow = ({
  request,
  visibleColumns,
  onClick,
  onDelete,
  onStatusChange,
  userRole,
  isSelected,
  onSelect,
  showSelection,
}: PurchaseRequestTableRowProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <TableRow
      onClick={handleClick}
      className={cn(
        "cursor-pointer hover:bg-muted/50",
        isSelected && "bg-muted/50"
      )}
    >
      {showSelection && (
        <TableCell className="pl-5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 rounded accent-primary"
          />
        </TableCell>
      )}
      {visibleColumns.number && <TableCell>{request.number}</TableCell>}
      {visibleColumns.laboratory && <TableCell>{request.laboratory?.name}</TableCell>}
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
        <TableCell>{request.purchase_request_items?.[0]?.quantity}</TableCell>
      )}
      {visibleColumns.unitPrice && (
        <TableCell>{request.purchase_request_items?.[0]?.unit_price}</TableCell>
      )}
      {visibleColumns.currency && (
        <TableCell>{request.purchase_request_items?.[0]?.currency}</TableCell>
      )}
      {visibleColumns.status && (
        <TableCell>
          <Badge className={statusConfig[request.status]?.className}>
            {statusConfig[request.status]?.label}
          </Badge>
        </TableCell>
      )}
      {visibleColumns.date && <TableCell>{request.created_at}</TableCell>}
      {visibleColumns.observations && <TableCell>{request.observations}</TableCell>}
      {visibleColumns.creator && (
        <TableCell>
          {request.profile && (
            <div className="text-sm text-muted-foreground">
              {request.profile.first_name} {request.profile.last_name}
            </div>
          )}
        </TableCell>
      )}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onClick}>
              <Edit className="mr-2 h-4 w-4" /> Ver Detalles
            </DropdownMenuItem>
            {userRole && ['admin', 'manager', 'Purchases'].includes(userRole) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(request.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {request.status !== 'purchased' && (
                  <DropdownMenuItem onClick={() => onStatusChange(request.id, 'purchased')}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Comprado
                  </DropdownMenuItem>
                )}
                {request.status !== 'ready_for_delivery' && (
                  <DropdownMenuItem onClick={() => onStatusChange(request.id, 'ready_for_delivery')}>
                    <Plane className="mr-2 h-4 w-4" /> Marcar como Listo para Entrega
                  </DropdownMenuItem>
                )}
                {request.status !== 'delivered' && (
                  <DropdownMenuItem onClick={() => onStatusChange(request.id, 'delivered')}>
                    <Loader2 className="mr-2 h-4 w-4" /> Marcar como Entregado
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
