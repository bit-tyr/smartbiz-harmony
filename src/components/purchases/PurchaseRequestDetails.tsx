import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseRequest } from "./types";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { PurchaseRequestForm } from "./PurchaseRequestForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseRequestDetailsProps {
  request: PurchaseRequest | null;
  onClose: () => void;
}

export const PurchaseRequestDetails = ({ request, onClose }: PurchaseRequestDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (!request) return null;

  const handleEdit = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Actualizar la solicitud principal
      const { error: requestError } = await supabase
        .from('purchase_requests')
        .update({
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || '',
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // Actualizar el item de la solicitud
      if (request.purchase_request_items?.[0]) {
        const { error: itemError } = await supabase
          .from('purchase_request_items')
          .update({
            product_id: values.productId,
            quantity: Number(values.quantity),
            unit_price: Number(values.unitPrice),
            currency: values.currency
          })
          .eq('id', request.purchase_request_items[0].id);

        if (itemError) throw itemError;
      }

      toast.success("Solicitud actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating purchase request:', error);
      toast.error("Error al actualizar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialValues = request.purchase_request_items?.[0] ? {
    laboratoryId: request.laboratory?.id || '',
    budgetCodeId: request.budget_code?.id || '',
    productId: request.purchase_request_items[0].product?.id || '',
    supplierId: request.purchase_request_items[0].product?.supplier?.id || '',
    quantity: request.purchase_request_items[0].quantity,
    unitPrice: request.purchase_request_items[0].unit_price || 0,
    currency: request.purchase_request_items[0].currency || '',
    observations: request.observations || ''
  } : null;

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles de la Solicitud #{request.number}</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          </div>
        </DialogHeader>

        {isEditing && initialValues ? (
          <PurchaseRequestForm
            onSubmit={handleEdit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsEditing(false)}
            initialValues={initialValues}
            isEditing={true}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Información General</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Estado</dt>
                    <dd>{request.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Fecha</dt>
                    <dd>{format(new Date(request.created_at), "PPP", { locale: es })}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Laboratorio</dt>
                    <dd>{request.laboratory?.name || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Código Presupuestal</dt>
                    <dd>
                      {request.budget_code ? (
                        <>
                          {request.budget_code.code}
                          <br />
                          <span className="text-sm text-gray-500">
                            {request.budget_code.description}
                          </span>
                        </>
                      ) : "-"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Detalles del Producto</h3>
                {request.purchase_request_items?.[0] && (
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Producto</dt>
                      <dd>{request.purchase_request_items[0].product?.name || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Proveedor</dt>
                      <dd>{request.purchase_request_items[0].product?.supplier?.name || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Cantidad</dt>
                      <dd>{request.purchase_request_items[0].quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Precio Unitario</dt>
                      <dd>
                        {request.purchase_request_items[0].unit_price
                          ? `${request.purchase_request_items[0].currency} ${request.purchase_request_items[0].unit_price}`
                          : "-"}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
            {request.observations && (
              <div>
                <h3 className="font-semibold mb-2">Observaciones</h3>
                <p className="text-gray-700">{request.observations}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};