import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import { PurchaseRequestTableHeader } from "./table/PurchaseRequestTableHeader";
import { PurchaseRequestTableRow } from "./table/PurchaseRequestTableRow";
import { ColumnSelector } from "./table/ColumnSelector";
import { Input } from "@/components/ui/input";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";
import { PurchaseRequest } from "./types";

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
          <option value="in_process">En proceso</option>
          <option value="purchased">Comprado</option>
          <option value="ready_for_delivery">Listo para entrega</option>
          <option value="delivered">Entregado</option>
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

      <PurchaseRequestDetails 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
};