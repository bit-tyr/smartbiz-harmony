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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PurchaseRequest {
  id: string;
  number: number;
  status: string;
  created_at: string;
  laboratory: { name: string } | null;
  budget_code: { code: string; description: string } | null;
  observations: string | null;
  purchase_request_items?: {
    product: { name: string } | null;
    supplier: { name: string } | null;
    quantity: number;
    unit_price: number;
    currency: string;
  }[];
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
  const [visibleColumns, setVisibleColumns] = useState({
    number: true,
    laboratory: true,
    budgetCode: true,
    product: true,
    supplier: true,
    quantity: true,
    unitPrice: true,
    currency: true,
    status: true,
    date: true,
    observations: true,
  });

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={visibleColumns.number}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, number: checked })
              }
            >
              Número
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.laboratory}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, laboratory: checked })
              }
            >
              Laboratorio
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.budgetCode}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, budgetCode: checked })
              }
            >
              Código Presupuestal
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.product}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, product: checked })
              }
            >
              Producto
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.supplier}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, supplier: checked })
              }
            >
              Proveedor
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.quantity}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, quantity: checked })
              }
            >
              Cantidad
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.unitPrice}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, unitPrice: checked })
              }
            >
              Precio Unitario
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.currency}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, currency: checked })
              }
            >
              Moneda
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.status}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, status: checked })
              }
            >
              Estado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.date}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, date: checked })
              }
            >
              Fecha
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.observations}
              onCheckedChange={(checked) =>
                setVisibleColumns({ ...visibleColumns, observations: checked })
              }
            >
              Observaciones
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
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
        <TableBody>
          {requests.map((request) => {
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
                  <TableCell>{firstItem?.supplier?.name || "-"}</TableCell>
                )}
                {visibleColumns.quantity && (
                  <TableCell>{firstItem?.quantity || "-"}</TableCell>
                )}
                {visibleColumns.unitPrice && (
                  <TableCell>
                    {firstItem?.unit_price ? 
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
          })}
        </TableBody>
      </Table>
    </div>
  );
};