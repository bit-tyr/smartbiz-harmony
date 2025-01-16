import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { AttachmentSection } from "./form-sections/AttachmentSection";
import { AttachmentList } from "./form-sections/AttachmentList";
import { AttachmentUploader } from "./form-sections/AttachmentUploader";
import { useForm } from "react-hook-form";

interface PurchaseRequestDetailsProps {
  request: PurchaseRequest | null;
  onClose: () => void;
}

export const PurchaseRequestDetails = ({ request, onClose }: PurchaseRequestDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm();

  if (!request) return null;

  const handleEdit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) throw new Error("No hay sesión de usuario");

      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) throw userError;

      const userName = `${userProfile.first_name} ${userProfile.last_name}`;

      const changedFields = [];
      if (values.laboratoryId !== request.laboratory?.id) changedFields.push('laboratorio');
      if (values.budgetCodeId !== request.budget_code?.id) changedFields.push('código presupuestal');
      if (values.observations !== request.observations) changedFields.push('observaciones');
      if (request.purchase_request_items?.[0]) {
        if (values.productId !== request.purchase_request_items[0].product?.id) changedFields.push('producto');
        if (Number(values.quantity) !== request.purchase_request_items[0].quantity) changedFields.push('cantidad');
        if (Number(values.unitPrice) !== request.purchase_request_items[0].unit_price) changedFields.push('precio unitario');
        if (values.currency !== request.purchase_request_items[0].currency) changedFields.push('moneda');
      }

      const { error: requestError } = await supabase
        .from('purchase_requests')
        .update({
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || null,
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

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

      if (sessionData.session.user.id !== request.user_id && changedFields.length > 0) {
        const changedFieldsText = changedFields.join(', ');
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            purchase_request_id: request.id,
            title: `Solicitud #${request.number} modificada`,
            message: `${userName} ha modificado los siguientes campos de tu solicitud: ${changedFieldsText}`,
            read: false
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      toast.success("Solicitud actualizada exitosamente");
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

  const statusConfig = {
    pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
    in_process: { label: "En Proceso", className: "bg-blue-100 text-blue-800" },
    purchased: { label: "Comprado", className: "bg-green-100 text-green-800" },
    ready_for_delivery: { label: "Listo para Entrega", className: "bg-purple-100 text-purple-800" },
    delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800" }
  };

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles de la Solicitud #{request.number}</DialogTitle>
            {!request.deleted_at && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            )}
          </div>
          <DialogDescription>
            Información detallada de la solicitud
          </DialogDescription>
        </DialogHeader>

        {isEditing && initialValues ? (
          <PurchaseRequestForm
            onSubmit={handleEdit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsEditing(false)}
            initialValues={initialValues}
            isEditing={true}
            purchaseRequestId={request.id}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Información General</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Estado</dt>
                    <dd>
                      <span className={`inline-block px-2 py-1 rounded-full text-sm ${statusConfig[request.status as keyof typeof statusConfig]?.className}`}>
                        {statusConfig[request.status as keyof typeof statusConfig]?.label || request.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Fecha de Creación</dt>
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
                  <div>
                    <dt className="text-sm text-gray-500">Creado por</dt>
                    <dd>
                      {request.profiles ? (
                        `${request.profiles.first_name} ${request.profiles.last_name}`
                      ) : "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd>{request.profiles?.email || "-"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Detalles del Producto y Viáticos</h3>
                {request.purchase_request_items?.[0] && (
                  <dl className="space-y-3">
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
                          ? `${request.purchase_request_items[0].currency} ${request.purchase_request_items[0].unit_price.toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Precio Total</dt>
                      <dd>
                        {request.purchase_request_items[0].unit_price
                          ? `${request.purchase_request_items[0].currency} ${(
                              request.purchase_request_items[0].unit_price * 
                              request.purchase_request_items[0].quantity
                            ).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
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
                <p className="text-gray-700 whitespace-pre-wrap">{request.observations}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-4">Archivos Adjuntos</h3>
              <div className="space-y-4">
                <AttachmentList 
                  purchaseRequestId={request.id}
                  canDelete={!request.deleted_at}
                />
                {!request.deleted_at && (
                  <AttachmentUploader 
                    purchaseRequestId={request.id}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};