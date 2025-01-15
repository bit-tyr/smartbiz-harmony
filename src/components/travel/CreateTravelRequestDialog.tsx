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
import { TravelRequestFormValues } from "./schemas/travelRequestSchema";

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

  const handleSubmit = async (values: TravelRequestFormValues) => {
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
          budget_code_id: values.budgetCodeId,
          destination: values.destination,
          departure_date: values.departureDate?.toISOString().split('T')[0],
          return_date: values.returnDate?.toISOString().split('T')[0],
          purpose: values.travelPurpose,
          total_estimated_budget: Number(values.allowanceAmount || 0),
          currency: values.currency || 'USD',
          status: 'pendiente',
          first_name: values.firstName,
          last_name: values.lastName,
          document_number: values.documentNumber,
          birth_date: values.birthDate?.toISOString().split('T')[0],
          document_expiry: values.documentExpiry?.toISOString().split('T')[0],
          phone: values.phone,
          email: values.email,
          travel_purpose: values.travelPurpose,
          needs_passage: values.needsPassage,
          needs_insurance: values.needsInsurance,
          emergency_contact: values.emergencyContact,
          preferred_schedule: values.preferredSchedule,
          requires_allowance: values.requiresAllowance,
          allowance_amount: values.allowanceAmount,
          bank: values.bank,
          accountNumber: values.accountNumber,
          accountHolder: values.accountHolder,
          hotelName: values.hotelName,
          check_in: values.checkIn?.toISOString().split('T')[0],
          check_out: values.checkOut?.toISOString().split('T')[0],
          number_of_days: values.numberOfDays
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Viaje</DialogTitle>
          <DialogDescription>
            Complete los detalles de la nueva solicitud de viaje
          </DialogDescription>
        </DialogHeader>
        <TravelRequestForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};