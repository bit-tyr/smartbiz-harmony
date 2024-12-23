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
      
      if (sessionError) throw sessionError;
      if (!session?.user) {
        toast.error("Usuario no autenticado");
        return;
      }

      const { error } = await supabase
        .from('purchase_requests')
        .insert({
          laboratory_id: values.laboratoryId,
          budget_code_id: values.budgetCodeId,
          observations: values.observations,
          user_id: session.user.id,
        });

      if (error) throw error;

      toast.success("Solicitud creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating purchase request:', error);
      toast.error("Error al crear la solicitud");
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