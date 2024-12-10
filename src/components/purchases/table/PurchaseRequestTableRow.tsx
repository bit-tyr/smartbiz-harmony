import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRequest } from "../PurchaseRequestList";

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
  };
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Aprobado", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rechazado", className: "bg-red-100 text-red-800" },
  };

  return statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    className: "bg-gray-100 text-gray-800" 
  };
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const PurchaseRequestTableRow = ({ 
  request, 
  visibleColumns 
}: PurchaseRequestTableRowProps) => {
  const status = getStatusBadge(request.status);
  const firstItem = request.purchase_request_items?.[0];

  return (
    <TableRow key={request.id}>
      {visibleColumns.number && (
        <TableCell className="font-medium">#{request.number}</TableCell>
      )}
      {visibleColumns.laboratory && (
        <TableCell>{request.laboratory?.name || "-"}</TableCell>
      )}
      {visibleColumns.budgetCode && (
        <TableCell>
          {request.budget_code ? (
            <div>
              <div className="font-medium">{request.budget_code.code}</div>
              <div className="text-sm text-gray-500">
                {request.budget_code.description}
              </div>
            </div>
          ) : "-"}
        </TableCell>
      )}
      {visibleColumns.product && (
        <TableCell>{firstItem?.product?.name || "-"}</TableCell>
      )}
      {visibleColumns.supplier && (
        <TableCell>{firstItem?.product?.supplier?.name || "-"}</TableCell>
      )}
      {visibleColumns.quantity && (
        <TableCell>{firstItem?.quantity || "-"}</TableCell>
      )}
      {visibleColumns.unitPrice && (
        <TableCell>
          {firstItem?.unit_price && firstItem.currency ? 
            formatCurrency(firstItem.unit_price, firstItem.currency) : 
            "-"
          }
        </TableCell>
      )}
      {visibleColumns.currency && (
        <TableCell>{firstItem?.currency || "-"}</TableCell>
      )}
      {visibleColumns.status && (
        <TableCell>
          <Badge variant="secondary" className={status.className}>
            {status.label}
          </Badge>
        </TableCell>
      )}
      {visibleColumns.date && (
        <TableCell>
          {format(new Date(request.created_at), "PPP", { locale: es })}
        </TableCell>
      )}
      {visibleColumns.observations && (
        <TableCell>{request.observations || "-"}</TableCell>
      )}
    </TableRow>
  );
};