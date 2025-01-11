import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TravelRequestFormValues, travelRequestSchema } from "./schemas/travelRequestSchema";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { TravelDetailsSection } from "./form-sections/TravelDetailsSection";
import { LaboratoryBudgetSection } from "./form-sections/LaboratoryBudgetSection";
import { AllowanceAccommodationSection } from "./form-sections/AllowanceAccommodationSection";
import { TravelAttachmentSection } from "./form-sections/AttachmentSection";

interface TravelRequestFormProps {
  onCancel: () => void;
}

export const TravelRequestForm = ({ onCancel }: TravelRequestFormProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const form = useForm<TravelRequestFormValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentNumber: "",
      birthDate: null,
      documentExpiry: null,
      phone: "",
      email: "",
      destination: "",
      departureDate: null,
      returnDate: null,
      travelPurpose: "",
      needsPassage: false,
      needsInsurance: false,
      emergencyContact: "",
      preferredSchedule: "",
      laboratoryId: "",
      budgetCodeId: "",
    },
  });

  const onSubmit = async (values: TravelRequestFormValues) => {
    console.log("Iniciando envío del formulario con valores:", values);
    setIsSubmittingForm(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No hay sesión de usuario activa');
        toast.error("Error de autenticación");
        return;
      }

      console.log("Preparando datos para enviar a la base de datos...");
      const travelRequest = {
        user_id: session.user.id,
        laboratory_id: values.laboratoryId,
        budget_code_id: values.budgetCodeId,
        destination: values.destination,
        departure_date: values.departureDate,
        return_date: values.returnDate,
        travel_purpose: values.travelPurpose,
        needs_passage: values.needsPassage,
        needs_insurance: values.needsInsurance,
        emergency_contact: values.emergencyContact,
        preferred_schedule: values.preferredSchedule,
        first_name: values.firstName,
        last_name: values.lastName,
        document_number: values.documentNumber,
        birth_date: values.birthDate,
        document_expiry: values.documentExpiry,
        phone: values.phone,
        email: values.email,
        created_by: session.user.id,
        status: 'pendiente',
      };

      console.log("Enviando solicitud a la base de datos:", travelRequest);
      const { data, error } = await supabase
        .from('travel_requests')
        .insert([travelRequest])
        .select()
        .single();

      if (error) {
        console.error('Error al guardar la solicitud:', error);
        throw error;
      }

      console.log("Solicitud guardada exitosamente:", data);

      if (selectedFiles.length > 0) {
        console.log("Iniciando carga de archivos...");
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
            toast.error(`Error al subir el archivo ${file.name}`);
            continue;
          }

          const { error: attachmentError } = await supabase
            .from('travel_attachments')
            .insert({
              travel_request_id: data.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
            });

          if (attachmentError) {
            console.error('Error al registrar archivo:', attachmentError);
          }
        }
        console.log("Archivos subidos exitosamente");
      }

      toast.success("Solicitud guardada exitosamente");
      form.reset();
      onCancel();
    } catch (error) {
      console.error('Error inesperado:', error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <PersonalInfoSection form={form} />
        <TravelDetailsSection form={form} />
        <LaboratoryBudgetSection form={form} />
        <AllowanceAccommodationSection form={form} />
        
        {form.formState.isSubmitSuccessful && (
          <TravelAttachmentSection
            travelRequestId={form.getValues().id}
            onFilesChange={handleFilesChange}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmittingForm}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmittingForm}
          >
            {isSubmittingForm ? (
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