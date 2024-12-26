import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseRequestForm } from "./PurchaseRequestForm";
import { toast } from "sonner";

interface CreatePurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseRequestDialog = ({
  open,
  onOpenChange,
}: CreatePurchaseRequestDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error de sesión:', sessionError);
        toast.error("Error al verificar la sesión");
        throw sessionError;
      }

      if (!session?.user) {
        toast.error("Usuario no autenticado");
        return;
      }

      // Crear la solicitud principal
      const { data: purchaseRequest, error: purchaseError } = await supabase
        .from('purchase_requests')
        .insert({
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || null,
          user_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Error al crear la solicitud:', purchaseError);
        if (purchaseError.code === '42501') {
          toast.error("No tienes permisos para crear solicitudes");
        } else if (purchaseError.code === '23503') {
          toast.error("Error de referencia: Verifica que el laboratorio y código presupuestal existan");
        } else {
          toast.error(`Error al crear la solicitud: ${purchaseError.message}`);
        }
        return;
      }

      // Crear el item de la solicitud
      const { error: itemError } = await supabase
        .from('purchase_request_items')
        .insert({
          purchase_request_id: purchaseRequest.id,
          product_id: values.productId,
          quantity: Number(values.quantity),
          unit_price: Number(values.unitPrice),
          currency: values.currency
        });

      if (itemError) {
        console.error('Error al crear el item de la solicitud:', itemError);
        // Eliminar la solicitud principal si falla la creación del item
        await supabase
          .from('purchase_requests')
          .delete()
          .eq('id', purchaseRequest.id);
        
        if (itemError.code === '23503') {
          toast.error("Error de referencia: Verifica que el producto exista");
        } else {
          toast.error(`Error al crear el item de la solicitud: ${itemError.message}`);
        }
        return;
      }

      toast.success("Solicitud creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error inesperado al crear la solicitud:', error);
      toast.error("Error inesperado al crear la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Compra</DialogTitle>
          <DialogDescription>
            Complete los campos para crear una nueva solicitud de compra
          </DialogDescription>
        </DialogHeader>
        <PurchaseRequestForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};