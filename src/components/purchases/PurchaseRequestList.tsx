import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import { PurchaseRequestTableHeader } from "./table/PurchaseRequestTableHeader";
import { PurchaseRequestTableRow } from "./table/PurchaseRequestTableRow";
import { ColumnSelector } from "./table/ColumnSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface PurchaseRequest {
  id: string;
  number: number;
  status: string;
  created_at: string;
  laboratory: { name: string } | null;
  budget_code: { code: string; description: string } | null;
  observations: string | null;
  purchase_request_items?: {
    quantity: number;
    unit_price: number | null;
    currency: string | null;
    product: {
      name: string;
      supplier: { name: string };
    } | null;
  }[];
}

interface PurchaseRequestListProps {
  requests: PurchaseRequest[];
  isLoading: boolean;
}

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

  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

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

  const handleColumnChange = (column: string, checked: boolean) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: checked,
    }));
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.number.toString().includes(searchQuery) ||
      request.laboratory?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.budget_code?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purchase_request_items?.[0]?.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purchase_request_items?.[0]?.product?.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Buscar solicitud..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="border rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      <ColumnSelector 
        visibleColumns={visibleColumns} 
        onColumnChange={handleColumnChange} 
      />

      <Table>
        <PurchaseRequestTableHeader visibleColumns={visibleColumns} />
        <TableBody>
          {filteredRequests.map((request) => (
            <PurchaseRequestTableRow
              key={request.id}
              request={request}
              visibleColumns={visibleColumns}
              onClick={() => setSelectedRequest(request)}
            />
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud #{selectedRequest?.number}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Información General</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Estado</dt>
                      <dd>{selectedRequest.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Fecha</dt>
                      <dd>{format(new Date(selectedRequest.created_at), "PPP", { locale: es })}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Laboratorio</dt>
                      <dd>{selectedRequest.laboratory?.name || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Código Presupuestal</dt>
                      <dd>
                        {selectedRequest.budget_code ? (
                          <>
                            {selectedRequest.budget_code.code}
                            <br />
                            <span className="text-sm text-gray-500">
                              {selectedRequest.budget_code.description}
                            </span>
                          </>
                        ) : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Detalles del Producto</h3>
                  {selectedRequest.purchase_request_items?.[0] && (
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-500">Producto</dt>
                        <dd>{selectedRequest.purchase_request_items[0].product?.name || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Proveedor</dt>
                        <dd>{selectedRequest.purchase_request_items[0].product?.supplier?.name || "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Cantidad</dt>
                        <dd>{selectedRequest.purchase_request_items[0].quantity}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Precio Unitario</dt>
                        <dd>
                          {selectedRequest.purchase_request_items[0].unit_price
                            ? `${selectedRequest.purchase_request_items[0].currency} ${selectedRequest.purchase_request_items[0].unit_price}`
                            : "-"}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
              {selectedRequest.observations && (
                <div>
                  <h3 className="font-semibold mb-2">Observaciones</h3>
                  <p className="text-gray-700">{selectedRequest.observations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};