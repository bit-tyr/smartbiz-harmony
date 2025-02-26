import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PurchaseRequest } from "../types";
import { Plane } from "lucide-react";

interface PurchaseRequestTableRowProps {
  request: PurchaseRequest;
  onSelect: (request: PurchaseRequest) => void;
}

const statusConfig = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
};

export const PurchaseRequestTableRow: React.FC<PurchaseRequestTableRowProps> = ({ request, onSelect }) => {
  const itemLimit = 3;
  const hasMoreItems = request.purchase_request_items && request.purchase_request_items.length > itemLimit;
  const displayedItems = request.purchase_request_items ? request.purchase_request_items.slice(0, itemLimit) : [];

  return (
    <TableRow>
      <TableCell className="font-medium">{request.number}</TableCell>
      <TableCell>{request.created_at}</TableCell>
      <TableCell>{request.laboratory?.name}</TableCell>
      <TableCell>
        {displayedItems.map((item, index) => (
          <div key={item.id}>
            {item.product?.name}
            {index < displayedItems.length - 1 && ", "}
          </div>
        ))}
        {hasMoreItems && "..."}
      </TableCell>
      <TableCell>
        <Badge className={statusConfig[request.status || 'pending']?.className}>
          {statusConfig[request.status || 'pending']?.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={() => onSelect(request)}>
          Ver Detalles
        </Button>
      </TableCell>
    </TableRow>
  );
};
