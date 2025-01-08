import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LaboratoryBudgetSection } from "./form-sections/LaboratoryBudgetSection";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { TravelDetailsSection } from "./form-sections/TravelDetailsSection";
import { AllowanceAccommodationSection } from "./form-sections/AllowanceAccommodationSection";
import { TravelAttachmentSection } from "./form-sections/AttachmentSection";
import { travelRequestSchema, TravelRequestFormValues } from "./schemas/travelRequestSchema";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type TravelRequestStatus = Database['public']['Enums']['travel_request_status'];

interface TravelRequestFormProps {
  onSubmit: (values: TravelRequestFormValues & { files: File[] }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  travelRequestId?: string;
}

export const TravelRequestForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
  travelRequestId
}: TravelRequestFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<TravelRequestFormValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      currency: 'USD',
      needsPassage: false,
      needsInsurance: false,
      requiresAllowance: false,
      allowanceAmount: 0,
      numberOfDays: 0,
      purpose: '',
      travelPurpose: '',
    },
  });

  const handleSubmit = async (values: TravelRequestFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }

      // Transform form values to match database schema
      const travelRequest = {
        laboratory_id: values.laboratoryId,
        budget_code_id: values.budgetCodeId,
        first_name: values.firstName,
        last_name: values.lastName,
        document_number: values.documentNumber,
        birth_date: values.birthDate?.toISOString().split('T')[0],
        document_expiry: values.documentExpiry?.toISOString().split('T')[0],
        phone: values.phone,
        email: values.email,
        destination: values.destination,
        departure_date: values.departureDate?.toISOString().split('T')[0],
        return_date: values.returnDate?.toISOString().split('T')[0],
        purpose: values.travelPurpose,
        needs_passage: values.needsPassage,
        needs_insurance: values.needsInsurance,
        insurance_period: values.insurancePeriod,
        emergency_contact: values.emergencyContact,
        additional_observations: values.additionalObservations,
        preferred_schedule: values.preferredSchedule,
        requires_allowance: values.requiresAllowance,
        allowance_amount: values.allowanceAmount,
        currency: values.currency,
        bank: values.bank,
        account_number: values.accountNumber,
        account_holder: values.accountHolder,
        hotel_name: values.hotelName,
        check_in: values.checkIn?.toISOString().split('T')[0],
        check_out: values.checkOut?.toISOString().split('T')[0],
        number_of_days: values.numberOfDays,
        created_by: user.id,
        user_id: user.id,
        status: 'pendiente' as TravelRequestStatus,
        total_estimated_budget: values.allowanceAmount || 0 // You might want to calculate this based on all expenses
      };

      const { data, error } = await supabase
        .from('travel_requests')
        .insert(travelRequest)
        .select()
        .single();

      if (error) {
        console.error('Error al guardar la solicitud:', error);
        toast.error("Error al guardar la solicitud");
        return;
      }

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const sanitizedName = file.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '_');
          
          const filePath = `${data.id}/${sanitizedName}`;

          const { error: uploadError } = await supabase.storage
            .from('travel-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error al subir archivo:', uploadError);
            toast.error(`Error al subir ${file.name}`);
            continue;
          }

          const { error: attachmentError } = await supabase
            .from('travel_attachments')
            .insert({
              travel_request_id: data.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size
            });

          if (attachmentError) {
            console.error('Error al guardar adjunto:', attachmentError);
            toast.error(`Error al registrar ${file.name}`);
            
            await supabase.storage
              .from('travel-attachments')
              .remove([filePath]);
          }
        }
      }

      toast.success("Solicitud guardada exitosamente");
      onCancel(); // Close the form
    } catch (error) {
      console.error('Error inesperado:', error);
      toast.error("Error al procesar la solicitud");
    }
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <LaboratoryBudgetSection form={form} />
        <PersonalInfoSection form={form} />
        <TravelDetailsSection form={form} />
        <AllowanceAccommodationSection form={form} />
        
        {travelRequestId && (
          <TravelAttachmentSection
            travelRequestId={travelRequestId}
            onFilesChange={handleFilesChange}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};