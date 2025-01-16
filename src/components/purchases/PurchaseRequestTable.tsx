import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// ... otros imports y código existente ...

interface PurchaseRequest {
  id: string;
  number: number;
  laboratory_id: string;
  budget_code_id: string;
  observations: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  user_id: string;
  laboratory: { name: string };
  budget_code: { code: string; description: string };
  purchase_request_items: Array<{
    quantity: number;
    unit_price: number;
    currency: string;
    product: {
      name: string;
      supplier: {
        name: string;
      };
    };
  }>;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const PurchaseRequestTable = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: purchaseRequests } = useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          laboratory:laboratories(name),
          budget_code:budget_codes(code, description),
          purchase_request_items(
            quantity,
            unit_price,
            currency,
            product:products(
              name,
              supplier:suppliers(name)
            )
          )
        `);
      if (error) throw error;
      return data;
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = purchaseRequests?.map(request => request.id) || [];
      setSelectedRequestIds(allIds);
    } else {
      setSelectedRequestIds([]);
    }
  };

  const handleSelectOne = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequestIds(prev => [...prev, requestId]);
    } else {
      setSelectedRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRequestIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('purchase_requests')
        .delete()
        .in('id', selectedRequestIds);

      if (error) throw error;

      toast.success(
        selectedRequestIds.length === 1 
          ? "Solicitud eliminada exitosamente"
          : "Solicitudes eliminadas exitosamente"
      );
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      setSelectedRequestIds([]);
    } catch (error) {
      console.error('Error deleting purchase requests:', error);
      toast.error("Error al eliminar las solicitudes");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="destructive"
        onClick={handleDeleteClick}
        className="flex items-center gap-2"
        disabled={selectedRequestIds.length === 0}
      >
        <Trash2 className="h-4 w-4" />
        <span>
          {selectedRequestIds.length === 0
            ? "Eliminar seleccionados"
            : `Eliminar seleccionados (${selectedRequestIds.length})`}
        </span>
      </Button>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedRequestIds.length === purchaseRequests?.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Laboratorio</TableHead>
            <TableHead>Código Presupuestal</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio Unitario</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Observaciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseRequests?.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <Checkbox
                  checked={selectedRequestIds.includes(request.id)}
                  onCheckedChange={(checked) => 
                    handleSelectOne(request.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>#{request.number}</TableCell>
              <TableCell>{request.laboratory?.name}</TableCell>
              <TableCell>{`${request.budget_code?.code} - ${request.budget_code?.description}`}</TableCell>
              <TableCell>
                {request.purchase_request_items?.map(item => item.product?.name).join(', ') || '-'}
              </TableCell>
              <TableCell>
                {request.purchase_request_items?.map(item => item.product?.supplier?.name).join(', ') || '-'}
              </TableCell>
              <TableCell>
                {request.purchase_request_items?.map(item => item.quantity).join(', ') || '-'}
              </TableCell>
              <TableCell>
                {request.purchase_request_items?.map(item => 
                  item.unit_price && item.currency ? 
                    formatCurrency(item.unit_price, item.currency) : 
                    '-'
                ).join(', ') || '-'}
              </TableCell>
              <TableCell>
                {request.purchase_request_items?.map(item => item.currency).join(', ') || '-'}
              </TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell>{request.created_at}</TableCell>
              <TableCell>{request.observations}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRequestIds.length === 1
                ? "Esta acción no se puede deshacer. Se eliminará permanentemente la solicitud de compra."
                : `Esta acción no se puede deshacer. Se eliminarán permanentemente ${selectedRequestIds.length} solicitudes de compra.`}
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