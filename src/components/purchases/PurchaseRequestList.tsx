import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PurchaseRequest {
  id: string;
  number: number;
  status: string;
  created_at: string;
  laboratory: { name: string } | null;
  budget_code: { code: string; description: string } | null;
}

interface PurchaseRequestListProps {
  requests: PurchaseRequest[];
  isLoading: boolean;
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

export const PurchaseRequestList = ({ requests, isLoading }: PurchaseRequestListProps) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;
  }

  if (!requests.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No hay solicitudes de compra registradas
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Laboratorio</TableHead>
          <TableHead>Código Presupuestal</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => {
          const status = getStatusBadge(request.status);
          
          return (
            <TableRow key={request.id}>
              <TableCell className="font-medium">#{request.number}</TableCell>
              <TableCell>{request.laboratory?.name || "-"}</TableCell>
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
              <TableCell>
                <Badge variant="secondary" className={status.className}>
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(request.created_at), "PPP", { locale: es })}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};