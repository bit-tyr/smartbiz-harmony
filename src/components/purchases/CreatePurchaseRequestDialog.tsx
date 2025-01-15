import { useState, useEffect } from "react";
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
import { sanitizeFileName } from "./form-sections/AttachmentSection";

interface CreatePurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseRequestDialog = ({
  open,
  onOpenChange,
}: CreatePurchaseRequestDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseRequestId, setPurchaseRequestId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && !purchaseRequestId) {
      setPurchaseRequestId(crypto.randomUUID());
    }
    if (!open) {
      setPurchaseRequestId(null);
    }
  }, [open]);

  const onSubmit = async (values: any) => {
    if (!purchaseRequestId) return;
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No hay sesión de usuario");
        return;
      }

      const { error: requestError } = await supabase
        .from('purchase_requests')
        .insert({
          id: purchaseRequestId,
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || null,
          status: 'pending',
          user_id: session.user.id,
          allowance_amount: values.allowanceAmount,
          account_number: values.accountNumber,
          account_holder: values.accountHolder,
          hotel_name: values.hotelName
        });

      if (requestError) {
        console.error('Error al crear la solicitud:', requestError);
        toast.error("Error al crear la solicitud");
        return;
      }

      const { error: itemError } = await supabase
        .from('purchase_request_items')
        .insert({
          purchase_request_id: purchaseRequestId,
          product_id: values.productId,
          quantity: Number(values.quantity),
          unit_price: Number(values.unitPrice),
          currency: values.currency
        });

      if (itemError) {
        console.error('Error al crear el item de la solicitud:', itemError);
        await supabase
          .from('purchase_requests')
          .delete()
          .eq('id', purchaseRequestId);
        
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Compra</DialogTitle>
          <DialogDescription>
            Complete los detalles de la nueva solicitud de compra
          </DialogDescription>
        </DialogHeader>
        <PurchaseRequestForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          purchaseRequestId={purchaseRequestId || undefined}
        />
      </DialogContent>
    </Dialog>
  );
};