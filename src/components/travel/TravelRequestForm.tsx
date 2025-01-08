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

      const finalValues = {
        ...values,
        purpose: values.travelPurpose,
        created_by: user.id,
        status: 'pendiente',
      };

      const { data, error } = await supabase
        .from('travel_requests')
        .insert([finalValues])
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
          const fileExt = file.name.split('.').pop();
          const filePath = `${data.id}/${Math.random()}.${fileExt}`;

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