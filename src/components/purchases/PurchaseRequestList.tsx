import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import { PurchaseRequestTableHeader } from "./table/PurchaseRequestTableHeader";
import { PurchaseRequestTableRow } from "./table/PurchaseRequestTableRow";
import { ColumnSelector } from "./table/ColumnSelector";
import { Input } from "@/components/ui/input";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";
import { PurchaseRequest } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseRequestListProps {
  requests: PurchaseRequest[];
  isLoading: boolean;
  onSelectRequest?: (request: PurchaseRequest | null) => void;
}

const statusConfig = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  purchased: { label: "Comprado", className: "bg-green-100 text-green-800 border-green-200" },
  ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 border-gray-200" }
};

interface UpdateStatusParams {
  request_id: string;
  new_status: string;
}

export const PurchaseRequestList = ({ 
  requests, 
  isLoading,
  onSelectRequest 
}: PurchaseRequestListProps) => {
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const handleDeleteClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRequestId) return;

    try {
      const { error } = await supabase
        .from('purchase_requests')
        .delete()
        .eq('id', selectedRequestId);

      if (error) throw error;

      toast.success("Solicitud eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    } catch (error) {
      console.error('Error deleting purchase request:', error);
      toast.error("Error al eliminar la solicitud");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      console.log('Actualizando estado:', { requestId, newStatus });

      const { data, error } = await supabase
        .from('purchase_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('Error al actualizar estado:', error);
        toast.error("Error al actualizar el estado");
        return;
      }

      console.log('Respuesta:', data);
      toast.success(`Estado actualizado a: ${statusConfig[newStatus].label}`);
      
      // Recargar los datos
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al actualizar el estado");
    }
  };

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
              onDelete={handleDeleteClick}
              onStatusChange={handleStatusChange}
            />
          ))}
        </TableBody>
      </Table>

      <PurchaseRequestDetails 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la solicitud de compra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
