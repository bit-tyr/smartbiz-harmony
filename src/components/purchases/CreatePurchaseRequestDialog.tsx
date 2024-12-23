import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PurchaseRequestForm } from "./PurchaseRequestForm";
import { toast } from "sonner";
import { FormValues } from "./PurchaseRequestForm";
import { Button } from "@/components/ui/button";

export const CreatePurchaseRequestDialog = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No hay sesión de usuario");
        return;
      }

      // Insertar la solicitud principal
      const { data: purchaseRequest, error: purchaseError } = await supabase
        .from('purchase_requests')
        .insert({
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations || '',
          status: 'pending',
          user_id: session.user.id
        })
        .select()
        .single();

      if (purchaseError) {
        toast.error("Error al crear la solicitud");
        throw purchaseError;
      }

      // Insertar el item de la solicitud con precio y moneda
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
        toast.error("Error al crear el item de la solicitud");
        throw itemError;
      }

      toast.success("Solicitud creada exitosamente");
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      onClose();
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nueva Solicitud</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Compra</DialogTitle>
        </DialogHeader>
        <PurchaseRequestForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};