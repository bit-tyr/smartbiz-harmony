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
import { TravelRequestForm } from "./TravelRequestForm";
import { toast } from "sonner";

interface CreateTravelRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTravelRequestDialog = ({
  open,
  onOpenChange,
}: CreateTravelRequestDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No hay sesión de usuario");
        return;
      }

      const { error: requestError } = await supabase
        .from('travel_requests')
        .insert({
          user_id: session.user.id,
          laboratory_id: values.laboratoryId,
          project_id: values.projectId,
          destination: values.destination,
          departure_date: values.departureDate,
          return_date: values.returnDate,
          purpose: values.purpose,
          total_estimated_budget: values.totalEstimatedBudget,
          currency: values.currency || 'USD'
        });

      if (requestError) {
        console.error('Error al crear la solicitud:', requestError);
        toast.error("Error al crear la solicitud");
        return;
      }

      toast.success("Solicitud creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['travelRequests'] });
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
          <DialogTitle>Nueva Solicitud de Viaje</DialogTitle>
          <DialogDescription>
            Complete los detalles de la nueva solicitud de viaje
          </DialogDescription>
        </DialogHeader>
        <TravelRequestForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};