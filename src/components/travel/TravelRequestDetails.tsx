import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TravelRequest } from "./types";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { TravelRequestForm } from "./TravelRequestForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { PersonalInfoSection } from "./details-sections/PersonalInfoSection";
import { TravelDetailsSection } from "./details-sections/TravelDetailsSection";
import { AllowanceSection } from "./details-sections/AllowanceSection";
import { AccommodationSection } from "./details-sections/AccommodationSection";

interface TravelRequestDetailsProps {
  request: TravelRequest | null;
  onClose: () => void;
}

export const TravelRequestDetails = ({ request, onClose }: TravelRequestDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (!request) return null;

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      // Map form values to match database column names
      const mappedValues = {
        ...values,
        account_holder: values.accountHolder,
        account_number: values.accountNumber,
        allowance_amount: values.allowanceAmount,
        hotel_name: values.hotelName,
        check_in: values.checkIn?.toISOString().split('T')[0],
        check_out: values.checkOut?.toISOString().split('T')[0],
        birth_date: values.birthDate?.toISOString().split('T')[0],
        document_expiry: values.documentExpiry?.toISOString().split('T')[0],
        departure_date: values.departureDate?.toISOString().split('T')[0],
        return_date: values.returnDate?.toISOString().split('T')[0],
        travel_purpose: values.travelPurpose,
        document_number: values.documentNumber,
        emergency_contact: values.emergencyContact,
        preferred_schedule: values.preferredSchedule,
        requires_allowance: values.requiresAllowance,
        needs_passage: values.needsPassage,
        needs_insurance: values.needsInsurance,
        number_of_days: values.numberOfDays,
        first_name: values.firstName,
        last_name: values.lastName,
      };

      // Remove camelCase properties to avoid conflicts
      delete mappedValues.accountHolder;
      delete mappedValues.accountNumber;
      delete mappedValues.allowanceAmount;
      delete mappedValues.hotelName;
      delete mappedValues.checkIn;
      delete mappedValues.checkOut;
      delete mappedValues.birthDate;
      delete mappedValues.documentExpiry;
      delete mappedValues.departureDate;
      delete mappedValues.returnDate;
      delete mappedValues.travelPurpose;
      delete mappedValues.documentNumber;
      delete mappedValues.emergencyContact;
      delete mappedValues.preferredSchedule;
      delete mappedValues.requiresAllowance;
      delete mappedValues.needsPassage;
      delete mappedValues.needsInsurance;
      delete mappedValues.numberOfDays;
      delete mappedValues.firstName;
      delete mappedValues.lastName;

      const { error } = await supabase
        .from('travel_requests')
        .update(mappedValues)
        .eq('id', request.id);

      if (error) throw error;

      toast.success("Solicitud de viaje actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ['travelRequests'] });
      onClose();
    } catch (error) {
      console.error('Error updating travel request:', error);
      toast.error("Error al actualizar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
    aprobado_por_gerente: { label: "Aprobado por Gerente", className: "bg-blue-100 text-blue-800" },
    aprobado_por_finanzas: { label: "Aprobado por Finanzas", className: "bg-green-100 text-green-800" },
    rechazado: { label: "Rechazado", className: "bg-red-100 text-red-800" },
    completado: { label: "Completado", className: "bg-gray-100 text-gray-800" }
  };

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Detalles de la Solicitud de Viaje</DialogTitle>
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
          <DialogDescription>
            Estado: <span className={`inline-block px-2 py-1 rounded-full text-sm ${statusConfig[request.status as keyof typeof statusConfig]?.className}`}>
              {statusConfig[request.status as keyof typeof statusConfig]?.label}
            </span>
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <TravelRequestForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsEditing(false)}
            initialValues={request}
            isEditing={true}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <PersonalInfoSection request={request} />
              <TravelDetailsSection request={request} />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <AllowanceSection request={request} />
              <AccommodationSection request={request} />
            </div>

            {request.additional_observations && (
              <div>
                <h3 className="font-semibold mb-2">Observaciones Adicionales</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {request.additional_observations}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};